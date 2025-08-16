'use client';

import { formatDate } from "@/utils/dateFormatter";
import { MdPhonelink } from "react-icons/md";
import ListItem from "./ListItem";

type DeviceListProps = {
    devices: any[];
    newDeviceKeys: Set<string>;
    isLoading?: boolean;
};
export default function DeviceList({devices, newDeviceKeys, isLoading = false}: DeviceListProps) {
  return (
        devices.map((d, i) => {
            const key = d.publicKeyBase64 || d.publicKey || d.pub
            const isNew = newDeviceKeys.has(key)
            return (
                <ListItem 
                    key={i}
                    index={i}
                    title={d.name}
                    subtitle={formatDate(d.joinedAt)}
                    leftButtonContent={
                        <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                            <div
                            className="bg-white text-slate-500 dark:bg-gray-950 w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-slate-300 border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all">
                                <MdPhonelink />
                            </div>
                        </div>
                    }
                    highlight={isNew} />
                
            )
        })
    );
}