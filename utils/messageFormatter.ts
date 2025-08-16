export const truncateString = (inputString: string): string => {
    if (inputString.length > 350) {
      return inputString.substring(0, 350) + "...";
    } else {
      return inputString;
    }
}