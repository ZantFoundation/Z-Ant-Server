import { ProgressBarProps } from "../types";

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
      <div
        className="h-full bg-amber-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
