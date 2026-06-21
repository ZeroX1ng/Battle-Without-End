import { useState } from 'react';
import type { TestSpeedMultiplier } from '../../core/debug/testSpeedControl';
import { TEST_SPEED_MULTIPLIERS } from '../../core/debug/testSpeedControl';

type TestSpeedControlProps = {
  value: TestSpeedMultiplier;
  onChange: (value: TestSpeedMultiplier) => void;
  oneHitKillEnabled: boolean;
  onOneHitKillToggle: () => void;
};

export function TestSpeedControl({
  value,
  onChange,
  oneHitKillEnabled,
  onOneHitKillToggle,
}: TestSpeedControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="test-speed-control" data-bwe-test-speed-control aria-label="Test speed control">
      <button
        type="button"
        className="test-speed-control__trigger"
        data-bwe-test-speed-trigger
        aria-expanded={isOpen}
        aria-label="测试倍速"
        title="测试倍速"
        onClick={() => setIsOpen(open => !open)}
      >
        {value}x
      </button>
      {isOpen && (
        <div className="test-speed-control__popover" data-bwe-test-speed-popover>
          <div className="test-speed-control__options" aria-label="Speed options">
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
          <button
            type="button"
            className="test-speed-control__button"
            data-bwe-test-one-hit-kill
            aria-pressed={oneHitKillEnabled}
            aria-label="无敌开关"
            title="无敌开关"
            onClick={onOneHitKillToggle}
          >
            无敌
          </button>
          <button
            type="button"
            className="test-speed-control__close"
            data-bwe-test-speed-close
            aria-label="关闭测试倍速"
            onClick={() => setIsOpen(false)}
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
