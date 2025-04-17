import { StatusMessageProps } from "../types";

const StatusMessage: React.FC<StatusMessageProps> = ({ error, success }) => {
  if (!error && !success) return null;

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 text-red-500 rounded-md">{error}</div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-green-50 text-green-600 rounded-md flex items-center justify-center">
      {success}
    </div>
  );
};

export default StatusMessage;
