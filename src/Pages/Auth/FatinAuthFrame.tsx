import type { ReactNode } from "react";

type FatinAuthFrameProps = {
  kicker: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function FatinAuthFrame({ kicker, title, children, footer }: FatinAuthFrameProps) {
  return (
    <div className="fatin-phone">
      <div className="fatin-phone-inner">
        <header className="fatin-phone-head">
          <p>{kicker}</p>
          <h1>{title}</h1>
        </header>
        <div className="fatin-phone-body">
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
