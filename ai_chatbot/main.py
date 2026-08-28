from fastapi import FastAPI

app = FastAPI()
# main
from chatbot.router import router as chatbot_router

app.include_router(chatbot_router)
