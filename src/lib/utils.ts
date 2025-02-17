
export const truncateText = (text: string, maxLength: number) => {
  if (typeof text !== 'string' || typeof maxLength !== 'number' || maxLength < 0) {
      throw new Error('Invalid input. Please provide a valid string and a non-negative number as maxLength.');
  }

  if (text.length <= maxLength) {
      return text;
  } else {
      const truncatedText = text.substring(0, maxLength) + '...';
      return truncatedText;
  }
};

export const copyToClipboard = async(text: string): Promise<void> => {
  try {
      await navigator.clipboard.writeText(text);
      console.log("Texto copiado al portapapeles con éxito!");
  } catch (err) {
      console.error("Error al copiar el texto al portapapeles:", err);
  }
}

export const shortenAddress = (address: string, startLength = 10, endLength = 12) => {
  if (address.length <= startLength + endLength) {
      return address;
  }
  return address.substring(0, startLength) + '....' + address.substring(address.length - endLength);
}

export const stringify: typeof JSON.stringify = (value, replacer, space) =>
  JSON.stringify(
    value,
    (key, value_) => {
      const value = typeof value_ === 'bigint' ? value_.toString() : value_
      return typeof replacer === 'function' ? replacer(key, value) : value
    },
    space,
  )

export const timeSince = (timestampSeconds: number): string => {
  const timeDifference = Math.floor(Date.now() / 1000) - timestampSeconds;

  const minute = 60, hour = minute * 60, day = hour * 24;

  if (timeDifference < minute) {
      return `${timeDifference} segundos`;
  } else if (timeDifference < hour) {
      return `${Math.floor(timeDifference / minute)} minutos`;
  } else if (timeDifference < day) {
      return `${Math.floor(timeDifference / hour)} horas`;
  } else {
    return `${Math.floor(timeDifference / day)} días`;
}
}

export const convertTimestampToDate = (timestamp: any) => {
    if (!timestamp) return "";

    const date = new Date(timestamp * 1000);

    return date.toLocaleString("es-AR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })
    .replace(",", "");
};

export const cutString = (str: string, length: number) => {
  if (str.length > length) {
    return str.substring(0, length) + "...";
  } else {
    return str;
  }
};

const utils = {
  truncateText,
  copyToClipboard,
  shortenAddress,
  stringify,
  timeSince,
  convertTimestampToDate
}

export default utils