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
  return (
    <label className={cx('wrapper', className)}>
      <input
        type="checkbox"
        className="switch-input"
        disabled={disabled}
        checked={checked}
        onChange={event => onChange(event.target.checked)}
      />
      <span className="switch-slider" />
      {label && <span className="switch-label">{label}</span>}
    </label>
  );
}
