import { Timestamp } from "firebase/firestore";

export const formatDate = (checkin: Timestamp): string => {
    const date = checkin.toDate();
    return `${String(date.getDate()).padStart(2, '0')}-` +
                    `${String(date.getMonth() + 1).padStart(2, '0')}-` +
                    `${date.getFullYear()} ` +
                    `${String(date.getHours()).padStart(2, '0')}:` +
                    `${String(date.getMinutes()).padStart(2, '0')}`;

   
};
