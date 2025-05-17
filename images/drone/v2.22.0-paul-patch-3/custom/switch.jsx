import React from 'react';
import classNames from 'classnames/bind';

const cx = classNames.bind({});

export default function Switch({
  checked,
  disabled,
  onChange,
  className = '',
  label = '',
}) {
  const id = `switch-${Math.random().toString(36).substring(2, 8)}`;
  const ariaLabel = label || 'Toggle switch';

  return (
    <div className={cx('switch-wrapper', className)}>
      <input
        id={id}
        type="checkbox"
        className="switch-input"
        disabled={disabled}
        checked={checked}
        onChange={event => onChange(event.target.checked)}
      />
      <label
        htmlFor={id}
        className="switch-slider"
        aria-label={ariaLabel}
        title={ariaLabel}
      />
      {label && (
        <span className="switch-label">{label}</span>
      )}
    </div>
  );
}
