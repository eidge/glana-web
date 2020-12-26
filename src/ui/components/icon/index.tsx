import * as icons from "./icons";

export type IconKey = keyof typeof icons;

type SizeOptions = "lg" | "sm";

const iconSizeClasses: { [key in SizeOptions]: string } = {
  lg: "w-8 h-8",
  sm: "w-5 h-5"
};

interface Props {
  icon: IconKey;
  size: SizeOptions;
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
  const classes = ["inline-block"];
  classes.push(iconSizeClasses[props.size || "lg"]);
  return classes.join(" ");
}
