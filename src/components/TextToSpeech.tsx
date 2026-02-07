"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface TextToSpeechProps {
    title: string;
    content: string;
}

export default function TextToSpeech({ title, content }: TextToSpeechProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
    const isCancelledRef = useRef(false);

    useEffect(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            setIsSupported(true);
            synthRef.current = window.speechSynthesis;
        }

        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const handlePlay = () => {
        if (!synthRef.current) return;

        if (isPaused) {
            synthRef.current.resume();
            setIsPaused(false);
            setIsPlaying(true);
            return;
        }

        if (isPlaying) return;

        isCancelledRef.current = false;
        synthRef.current.cancel();
        utterancesRef.current = [];

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = content;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";
        const fullText = `${title}. ${cleanText}`;

        const chunks = fullText.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [fullText];
        const validChunks = chunks.map(c => c.trim()).filter(c => c.length > 0);

        validChunks.forEach((chunk, index) => {
            const utterance = new SpeechSynthesisUtterance(chunk);

            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterancesRef.current.push(utterance);

            utterance.onstart = () => {
                if (!isCancelledRef.current) {
                    setIsPlaying(true);
                    setIsPaused(false);
                }
            };

            utterance.onend = () => {
                if (index === validChunks.length - 1 && !isCancelledRef.current) {
                    setIsPlaying(false);
                    setIsPaused(false);
                    utterancesRef.current = [];
                }
            };

            utterance.onerror = (event) => {
                const errorType = event.error || 'unknown';

                if (errorType === 'interrupted' || errorType === 'canceled' || isCancelledRef.current) {
                    return;
                }

                console.warn("TTS Warning:", {
                    error: errorType,
                    message: (event as any).message || 'No message',
                    chunkIndex: index,
                    totalChunks: validChunks.length
                });
            };

            synthRef.current?.speak(utterance);
        });
    };

    const handlePause = () => {
        if (!synthRef.current) return;
        synthRef.current.pause();
        setIsPaused(true);
        setIsPlaying(false);
    };

    const handleStop = () => {
        if (!synthRef.current) return;
        isCancelledRef.current = true;
        synthRef.current.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        utterancesRef.current = [];
    };

    if (!isSupported) return null;

    return (
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border mb-6">
            <Volume2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium flex-1">Listen to this article</span>

            <Button
                onClick={!isPlaying && !isPaused ? handlePlay : isPaused ? handlePlay : handlePause}
                variant="outline"
                size="sm"
                className="gap-2"
            >
                {!isPlaying && !isPaused ? (
                    <>
                        <Play className="h-4 w-4" />
                        Play
                    </>
                ) : isPaused ? (
                    <>
                        <Play className="h-4 w-4" />
                        Resume
                    </>
                ) : (
                    <>
                        <Pause className="h-4 w-4" />
                        Pause
                    </>
                )}
            </Button>

            {(isPlaying || isPaused) && (
                <Button
                    onClick={handleStop}
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                >
                    <RotateCcw className="h-4 w-4" />
                    Stop
                </Button>
            )}
        </div>
    );
}