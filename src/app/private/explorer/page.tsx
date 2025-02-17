"use client";

import { useState } from "react";

import KeyListItem from "@/components/KeyListItem";
import Topbar from "@/components/Topbar";
import { useUsersData } from "@/lib/hooks";

interface ToggleButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    className?: string;
}

const ToggleButton = ({ label, isActive, onClick, className }: ToggleButtonProps) => {
    return (
        <button
            className={
                "py-2 px-4 rounded-full focus:outline-none " +
                (isActive ? "bg-gray-400 text-white font-bold" : "bg-gray-100 text-gray-800") +
                (className ? ` ${className}` : "")
            }
            onClick={onClick}
        >
            {label}
        </button>
    );
};

function UsersExplorer() {        
    const [sortType, setSortType] = useState<'newest' | 'top'>('newest');
    const users = useUsersData({ sortType });

    return (
        <div className="min-h-screen">
            <Topbar />
            <div className="max-w-sm mx-auto mb-20">
                <div className="flex bg-gray-100 p-1 rounded-full mb-4">
                    <ToggleButton
                        label="Recientes"
                        isActive={sortType === "newest"}
                        onClick={() => setSortType("newest")}
                        className="mr-2"
                    />
                    <ToggleButton
                        label="Populares"
                        isActive={sortType === "top"}
                        onClick={() => setSortType("top")}
                    />
                </div>

                <div className="overflow-y-auto">
                    {users.map((user, key) => (
                        <KeyListItem key={key} keyId={user.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UsersExplorer;
