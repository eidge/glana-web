import Icon, { IconKey } from "./icon";

export type SizeOptions = "lg";
export type ColorOptions = "white";

interface Props {
  size: SizeOptions;
  color: ColorOptions;
  onClick: () => void;
  icon?: IconKey;
  text?: string;
  className?: string;
}

export default function Button(props: Props) {
  const { size, icon, text, onClick } = props;

  return (
    <button className={buttonClasses(props)} onClick={onClick} type="button">
      {icon && <Icon icon={icon} size={size} />}
      {text && <span className={textClasses(props)}>{text}</span>}
      <style jsx>{`
        .gl-button {
          font-size: 0;
        }
      `}</style>
    </button>
  );
}

function buttonClasses(props: Props) {
  return [
    "gl-button",
    "inline-flex items-center justify-center",
    "leading-none p-2",
    "focus:outline-none rounded",
    colorClasses(props),
    props.className
  ].join(" ");
}

function colorClasses(props: Props) {
  switch (props.color) {
    case "white":
      return "text-white hover:bg-white hover:bg-opacity-10";
  }
}

function textClasses(props: Props) {
  const classes = ["text-2xl leading-none"];
  if (props.icon) {
    classes.push("pl-2");
  }
  return classes.join(" ");
}
