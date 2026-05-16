/** Tiny React wrapper around mountWidget. */
import { useEffect, useRef } from "react";
import { mountWidget } from "@latrinebot/widgets";

export interface LatrineWidgetProps {
  widgetId: string;
  pollSec?: number;
  theme?: "medieval" | "stream-dark" | "stream-light" | "minimal" | "obs" | "cyberpunk" | "pastel" | "brutalist";
  className?: string;
  style?: React.CSSProperties;
}

export function LatrineWidget(props: LatrineWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctrl = mountWidget({
      widgetId: props.widgetId,
      target: ref.current,
      pollSec: props.pollSec,
      theme: props.theme,
    });
    return () => ctrl.destroy();
  }, [props.widgetId, props.pollSec, props.theme]);

  return <div ref={ref} className={props.className} style={props.style} />;
}
