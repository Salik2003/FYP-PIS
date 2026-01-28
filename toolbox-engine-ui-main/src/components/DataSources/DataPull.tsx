import { useEffect, useRef, useState } from "react";
import { IoSyncCircle } from "react-icons/io5";
import { formatDateTime } from "../../common/formatters";
import { toolboxEngineAPI } from "../../common/toolbox-engine.api";

interface Props {
    targetType: "DATA_SOURCE" | "TABLE" | "ROW" | "CELL";
    targetId: number;
    onBack: () => void;
}

const DataPull: React.FC<Props> = ({ targetType, targetId }) => {
    const [loadingMessage, setLoadingMessage] = useState<string | null>("Loading pull data...");
    const [pull, setPull] = useState<any | null>(null);
    const [polling, setPolling] = useState<boolean>(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchFirstPull = async () => {
            const response = await toolboxEngineAPI.get(`/api/data_source_pulls?targetType=${targetType}&targetId=${targetId}&last=true&includeDataCount=true`);
            const data = response.data;
            setPull(data.length > 0 ? data[0] : null);
        };
        fetchFirstPull();
    }, [targetType, targetId]);

    useEffect(() => {
        setLoadingMessage(null);
    }, [pull]);

    useEffect(() => {
        if (polling && pull) {
            startPolling();
        }
    }, [polling, pull]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const startPolling = async () => {
        if (pull === null) {
            return;
        }
        
        // Clear any existing interval before setting a new one
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(async () => {
            const response = await toolboxEngineAPI.get(`/api/data_source_pulls/${pull?.id}`);
            const data = response.data;
            setPull(data);
        }, 2000);
        
        setPolling(true);
    };

    const syncData = async () => {
        const response = await toolboxEngineAPI.post(`/api/data_source_pulls`, { targetType: targetType, targetId: targetId });
        setPull(response.data);
        setPolling(true);
    };

    if (loadingMessage) {
        return <div>{loadingMessage}</div>;
    }
    const fontSize = 20;

    return <div className="flex items-center whitespace-nowrap gap-1 m-1">
        <div className="relative group cursor-pointer">
            {( pull == null || pull?.status === "CREATED" ) && <IoSyncCircle className="text-gray-500 cursor-pointer" size={fontSize} onClick={syncData}></IoSyncCircle>}
            {pull?.status === "PULLING" && <IoSyncCircle className="text-green-500 animate-spin cursor-pointer" size={fontSize} onClick={syncData}></IoSyncCircle>}
            {pull?.status === "PULL_COMPLETED" && <IoSyncCircle className="text-green-500 cursor-pointer" size={fontSize} onClick={syncData}></IoSyncCircle>}
            {pull?.status === "PULL_FAILED" && <IoSyncCircle className="text-red-500 cursor-pointer" size={fontSize} onClick={syncData}></IoSyncCircle>}
            {pull?.status === "SUBMITTING" && <IoSyncCircle className="text-green-500 animate-spin cursor-pointer" size={fontSize} onClick={syncData}></IoSyncCircle>}
            {pull?.status === "SUBMIT_COMPLETED" && <IoSyncCircle className="text-green-500 cursor-pointer" size={fontSize} onClick={syncData}></IoSyncCircle>}
            {pull?.status === "SUBMIT_FAILED" && <IoSyncCircle className="text-red-500 cursor-pointer" size={fontSize} onClick={syncData}></IoSyncCircle>} 
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                { pull && (
                    <div className="flex items-center gap-2">
                        <span>{pull?.status}</span>
                        <span>{pull.pulledCount} of {pull?.count} row(s) fetched at {formatDateTime(pull.updatedAt)}</span>
                    </div>
                )}
                { pull == null && "No pull found" }
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
        </div>
    </div>;
};

export default DataPull;
