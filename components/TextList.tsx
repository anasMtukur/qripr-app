'use client';

import { copyToClipboard } from "@/utils/clipboard";
import { formatDate } from "@/utils/dateFormatter";
import { truncateString } from "@/utils/messageFormatter";
import { GoCopy, GoTrash } from "react-icons/go";
import TextItem from "./TextItem";

type TextListProps = {
    messages: any[];
};
export default function TextList({messages}: TextListProps) {
  return (
    messages.map((m, i) => (
      <TextItem 
        index={i} 
        text={m.plain}
        sender={`${m.senderPublicKeyBase64.substring(0, 12)}${m.senderPublicKeyBase64.slice(-6)}..`} 
        sentOn={m.timestamp} isDecrypted={m.plain !== undefined} />
      ))
    );
}