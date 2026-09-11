const express = require("express");
const router = express.Router();
const axios = require("axios");
const { protect, authorize } = require("../middleware/authMiddleware");
const Problem = require("../models/Problem");
const { upload, uploadToCloudinary } = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

const AI_ENGINE = process.env.AI_ENGINE_URL || "http://localhost:8000";
const CHATBOT_ENGINE = process.env.CHATBOT_ENGINE_URL || "http://127.0.0.1:8001";

// Public Route: Anyone can view public problems (for Map etc.)
router.get("/public", async (req, res) => {
  try {
    const problems = await Problem.find()
      .populate("reportedBy", "name")
      .sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Protected Route: Role-based problem fetching
router.get("/", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'citizen') {
      query.reportedBy = req.user._id;
    }
    const problems = await Problem.find(query)
      .populate("reportedBy", "name")
      .sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// AI Engine Preview Route
router.post("/classify", protect, authorize("citizen"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const textToClassify = description || title;
    
    // Call the fast Chatbot NLP classification service
    const aiResponse = await axios.post(`${CHATBOT_ENGINE}/internal/ai/classify`, {
      complaint: textToClassify
    });
    
    res.json(aiResponse.data);
  } catch (error) {
    console.error("AI Preview Error:", error.message);
    res.status(500).json({ message: "AI Classification failed", error: error.message });
  }
});

// ============================================================================
// STAGE 1: CITIZEN SUBMITS GRIEVANCE
// Runs: Cloudinary Upload -> Part B AI Agent -> DB Save
// ============================================================================
router.post("/", protect, authorize("citizen"), upload.array("images", 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Uploading valid proof (image) is required to report a problem." });
    }

    // 1. Resolve Category (Default / User-provided)
    let category = req.body.category || "other";

    // 2. Parse Location
    let location = req.body.location;
    if (typeof location === "string") {
      try {
        location = JSON.parse(location);
      } catch (parseErr) {
        console.error("Location JSON parse error:", parseErr.message);
      }
    }

    // 3. Process Cloudinary Image Uploads
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    // 4. Call AI Agent
    let aiData = {};
    try {
      const aiResponse = await axios.post(`${AI_ENGINE}/agent/automate`, {
        action: "CITIZEN_SUBMISSION",
        payload: {
          citizen_name: req.user.name || "Citizen",
          text: req.body.description || req.body.title,
          category: category,
          location: location,
          image_path: uploadedImages.length > 0 ? uploadedImages[0].url : ""
        }
      });
      aiData = aiResponse.data;
    } catch (aiErr) {
      console.error("AI Agent Integration Error:", aiErr.message);
    }

    // 5. Save Problem to MongoDB with AI Master Ticket ID & SLA targets
    const isFlagged = category === 'other' || category.includes('Hazards') || category.includes('Safety');

    let parsedAiMetadata = {};
    if (req.body.aiMetadata) {
      try {
        parsedAiMetadata = JSON.parse(req.body.aiMetadata);
      } catch (err) {
        console.error("AI Metadata parse error:", err.message);
      }
    }

    const newProblem = new Problem({
      ...req.body,
      ticketId: aiData.ticket_id || aiData.master_ticket_id || `TCK-${Date.now()}`,
      category: parsedAiMetadata.category || aiData.ticket?.category || category,
      department: parsedAiMetadata.department || aiData.ticket?.department || "Public Works Department",
      severity: parsedAiMetadata.severity || aiData.ticket?.severity || "medium",
      slaHours: aiData.ticket?.sla_hours || 72,
      location,
      images: uploadedImages,
      reportedBy: req.user._id,
      aiMetadata: {
        category: parsedAiMetadata.category || aiData.ticket?.category || category,
        confidence: parsedAiMetadata.confidence || 0.9,
        severity: parsedAiMetadata.severity || aiData.ticket?.severity || 'medium',
        priority: parsedAiMetadata.priority || 50,
        needsHumanReview: parsedAiMetadata.needsHumanReview || false,
        flagReason: 'new_intake',
        flaggedForReview: isFlagged
      },
      moderation: { status: 'pending' },
      timeline: [
        { stage: "Reported", timestamp: new Date(), actor: "Citizen", notes: "Citizen submitted grievance" },
        { stage: "Triaged by AI-Agent", timestamp: new Date(), actor: "Samvad-Setu AI", notes: "Auto-triaged by engine" },
      ],
    });

    const savedProblem = await newProblem.save();

    if (savedProblem.aiMetadata.flaggedForReview) {
      try {
        const io = require('../../app').io;
        if (io) io.to('admin_alerts').emit('moderation:new_item', savedProblem);
      } catch (err) {
        console.error("Socket error:", err);
      }
    }

    res.status(201).json({
      status: "success",
      problem: savedProblem,
      ai_result: aiData
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Role-Restricted Route: Only 'citizen' can delete their own problem
router.delete("/:id", protect, authorize("citizen"), async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, reportedBy: req.user._id });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found or unauthorized to delete" });
    }

    if (problem.images && problem.images.length > 0) {
      for (const image of problem.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await Problem.findByIdAndDelete(req.params.id);
    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ============================================================================
// STAGE 2: MUNICIPAL GOVERNMENT ATTEMPT & ESCALATION TRIGGER
// ============================================================================
router.patch("/:id/moderate", protect, authorize("government_admin", "govt_admin", "platform_admin"), async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    // Call AI-Agent with Municipal Attempt Outcome
    let aiData = {};
    try {
      const aiResponse = await axios.post(`${AI_ENGINE}/agent/automate`, {
        action: "GOVERNMENT_STATUS_UPDATE",
        payload: {
          ticket_id: problem.ticketId || req.params.id,
          attempt_status: req.body.status, // "RESOLVED" or "FAILED"
          officer_name: req.user.name,
          notes: req.body.notes || "Moderated via portal.",
          generate_dossier: true
        }
      });
      aiData = aiResponse.data;
    } catch (aiErr) {
      console.error("AI Agent Escalation Error:", aiErr.message);
    }

    problem.status = req.body.status === "RESOLVED" ? "Resolved" : "Escalated_To_HEI";
    problem.timeline.push({
      stage: problem.status,
      timestamp: new Date(),
      actor: req.user.name,
      notes: req.body.notes
    });

    await problem.save();

    res.json({
      status: "success",
      problem_status: problem.status,
      ai_result: aiData
    });
  } catch (error) {
    res.status(500).json({ message: "Moderation error", error: error.message });
  }
});

// ============================================================================
// STAGE 3: HEI STUDENT CAPSTONE PROTOTYPE SUBMISSION
// ============================================================================
router.post("/:id/prototype", protect, authorize("hei", "hei_admin"), async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const aiResponse = await axios.post(`${AI_ENGINE}/agent/automate`, {
      action: "HEI_PROTOTYPE_SUBMIT",
      payload: {
        ticket_id: problem.ticketId || req.params.id,
        prototype_title: req.body.prototype_title,
        team_name: req.body.team_name,
        institution_name: req.body.institution_name,
        faculty_mentor: req.body.faculty_mentor,
        student_year_level: req.body.student_year_level || 4,
        trl_level: req.body.trl_level || 6,
        total_funding_required_inr: req.body.total_funding_required_inr || 250000.0,
        bill_of_materials: req.body.bill_of_materials || [],
        technical_abstract: req.body.technical_abstract
      }
    });

    res.json({
      status: "success",
      message: "Prototype registered in Corporate Showcase",
      data: aiResponse.data
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.detail || error.message
    });
  }
});

// ============================================================================
// STAGE 4: CORPORATE CSR FUNDING PLEDGE
// ============================================================================
router.post("/:id/pledge", protect, authorize("corporate", "sponsor"), async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const aiResponse = await axios.post(`${AI_ENGINE}/agent/automate`, {
      action: "CORPORATE_PLEDGE",
      payload: {
        ticket_id: problem.ticketId || req.params.id,
        sponsor_id: req.body.sponsor_id || "CORP-TATA-01",
        pledged_amount_inr: req.body.pledged_amount_inr || 250000.0,
        representative_name: req.user.name,
        contact_email: req.user.email
      }
    });

    res.json({
      status: "success",
      message: "CSR Pledge registered & Tranche 1 (30%) disbursed to HEI Lab Escrow",
      data: aiResponse.data
    });
  } catch (error) {
    res.status(500).json({ message: "Corporate pledge error", error: error.message });
  }
});

// ============================================================================
// STAGE 5: MUNICIPAL SITE CLEARANCE GATEKEEPER
// ============================================================================
router.post("/:id/site-clearance", protect, authorize("government_admin", "govt_admin", "platform_admin"), async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const aiResponse = await axios.post(`${AI_ENGINE}/agent/automate`, {
      action: "MUNICIPAL_SITE_CLEARANCE",
      payload: {
        ticket_id: problem.ticketId || req.params.id,
        officer_name: req.user.name,
        site_inspection_notes: req.body.notes || "Site surveyed. Traffic diversion verified. Pilot permitted."
      }
    });

    res.json({
      status: "success",
      message: "Site clearance granted & Tranche 2 (40%) disbursed for Field Pilot",
      data: aiResponse.data
    });
  } catch (error) {
    res.status(500).json({ message: "Site clearance error", error: error.message });
  }
});

// ============================================================================
// STAGE 6: FINAL CIVIC HANDOVER & MCA SECTION 135 CSR CERTIFICATE
// ============================================================================
router.post("/:id/handover-certificate", protect, authorize("corporate_auditor", "government_admin", "govt_admin", "platform_admin"), async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const aiResponse = await axios.post(`${AI_ENGINE}/agent/automate`, {
      action: "CIVIC_HANDOVER_AND_CERTIFICATION",
      payload: {
        ticket_id: problem.ticketId || req.params.id,
        corporate_auditor_name: req.user.name,
        handover_notes: req.body.notes || "Tested for 30 consecutive days with zero defects. Remediation permanent."
      }
    });

    res.json({
      status: "success",
      message: "Civic Handover complete & MCA Section 135 CSR Certificate issued",
      data: aiResponse.data
    });
  } catch (error) {
    res.status(500).json({ message: "Handover certification error", error: error.message });
  }
});

module.exports = router;