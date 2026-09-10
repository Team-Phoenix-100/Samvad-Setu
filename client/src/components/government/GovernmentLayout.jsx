import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import GovSidebar from './GovSidebar';
import GovTopbar from './GovTopbar';
import { useGovModerationStore } from '../../store/govModerationStore';
import { useGovInstitutionStore } from '../../store/govInstitutionStore';
import { useToastStore } from '../../store/toastStore';

export default function GovernmentLayout() {
  const { incrementUnread } = useGovModerationStore();
  const { incrementPending } = useGovInstitutionStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    // Connect to Socket.io for live updates
    const socket = io('http://localhost:5001');

    socket.on('connect', () => {
      socket.emit('join_admin');
    });

    socket.on('moderation:new_item', (problem) => {
      incrementUnread();
      showToast(`AI Flagged New Issue: ${problem.title}`, 'warning');
    });

    socket.on('institution:new_signup', (institution) => {
      incrementPending();
      showToast(`New Registration: ${institution.name} pending verification`, 'success');
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Empty deps to prevent infinite reconnection loop

  return (
    <div className="flex h-screen bg-[#0F1B1E] overflow-hidden text-[#F2EFE9] font-body">
      <GovSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GovTopbar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#0F1B1E]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
