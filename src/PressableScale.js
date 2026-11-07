import { Pressable } from 'react-native';

export default function PressableScale({ style, children, disabled, ...props }) {
  return (
    <Pressable
      disabled={disabled}
      style={(state) => {
        const base = typeof style === 'function' ? style(state) : style;
        return [base, state.pressed && !disabled && { opacity: 0.6, transform: [{ scale: 0.97 }] }];
      }}
      {...props}
    >
      {children}
    </Pressable>
  );
}
