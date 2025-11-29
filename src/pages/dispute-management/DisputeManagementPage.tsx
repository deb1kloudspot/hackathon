import { useState } from "react";
import { Button } from "@/components/ui/button";

const Chatbot = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState<string>("");

    const handleSend = () => {
        if (input.trim()) {
            setMessages([...messages, `You: ${input}`, "Chatbot: I'm processing your issue..."]);
            setInput("");
            // Simulate chatbot response with a delay
            setTimeout(() => {
                setMessages([...messages, `You: ${input}`, "Chatbot: Your issue is being processed. We will notify you shortly."]);
            }, 1500);
        }
    };

    return (
        <div className="bg-slate-800 p-4 rounded-xl space-y-4">
            <div className="space-y-2 h-60 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className="text-white">
                        {msg}
                    </div>
                ))}
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    className="flex-1 p-2 rounded-md bg-background border border-border/50 text-white"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                />
                <Button onClick={handleSend} className="bg-primary text-primary-foreground">
                    Send
                </Button>
            </div>
        </div>
    );
};

export default Chatbot;
