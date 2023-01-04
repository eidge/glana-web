import * as icons from "./icons";

export type IconKey = keyof typeof icons;

type SizeOptions = "lg" | "md";

const iconSizeClasses: { [key in SizeOptions]: string } = {
  lg: "w-8 h-8",
  md: "w-4 h-4",
};

interface Props {
  icon: IconKey;
  size: SizeOptions;
  className?: string;
}

export default function Icon(props: Props) {
  const { icon } = props;
  return (
    <i aria-label={icon} className={classes(props)}>
      {icons[icon]()}
    </i>
  );
}

function classes(props: Props) {
  const classes = ["inline-block", props.className || ""];
  classes.push(iconSizeClasses[props.size || "lg"]);
  return classes.join(" ");
}
