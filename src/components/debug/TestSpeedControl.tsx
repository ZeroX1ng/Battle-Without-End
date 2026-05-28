import type { TestSpeedMultiplier } from '../../core/debug/testSpeedControl';
import { TEST_SPEED_MULTIPLIERS } from '../../core/debug/testSpeedControl';

type TestSpeedControlProps = {
  value: TestSpeedMultiplier;
  onChange: (value: TestSpeedMultiplier) => void;
};

export function TestSpeedControl({ value, onChange }: TestSpeedControlProps) {
  return (
    <div className="test-speed-control" data-bwe-test-speed-control aria-label="Test speed control">
      {TEST_SPEED_MULTIPLIERS.map((multiplier) => (
        <button
          key={multiplier}
          type="button"
          className="test-speed-control__button"
          data-bwe-test-speed-option={`${multiplier}x`}
          aria-pressed={multiplier === value}
          onClick={() => onChange(multiplier)}
        >
          {multiplier}x
        </button>
      ))}
    </div>
  );
}
