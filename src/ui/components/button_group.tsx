import { ColorOptions } from "./button";
import Button, { SizeOptions, TypeOptions } from "./button";
import { IconKey } from "./icon";

interface ButtonProps {
  onClick: () => void;
  icon?: IconKey;
  text?: string;
  isPressed?: boolean;
}

interface Props {
  size: SizeOptions;
  color: ColorOptions;
  type?: TypeOptions;
  buttons: ButtonProps[];
}

export default function ButtonGroup(props: Props) {
  const { size, color, buttons, type } = props;
  return (
    <div className="inline-block rounded overflow-hidden divide-x">
      {buttons.map((buttonProps, idx) => (
        <Button
          key={idx}
          size={size}
          color={color}
          type={type}
          inButtonGroup={true}
          className="rounded-none"
          {...buttonProps}
        />
      ))}
    </div>
  );
}
