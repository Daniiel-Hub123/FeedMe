import { forwardRef, HTMLAttributes } from "react";

interface TdHiddenProps extends HTMLAttributes<HTMLTableCellElement> {}
export const TdHidden = forwardRef<HTMLTableCellElement, TdHiddenProps>(
  ({ className, children, ...props }, ref) => (
    <td ref={ref} className={`hiddenCol ${className ?? ""}`} {...props}>
      {children}
    </td>
  )
);

TdHidden.displayName = "TdHidden";
interface ThHiddenProps extends HTMLAttributes<HTMLTableHeaderCellElement> {
  // Si quieres, puedes añadir props extra aquí
}
export const ThHidden = forwardRef<HTMLTableHeaderCellElement, ThHiddenProps>(
  ({ className, children, ...props }, ref) => (
    <th ref={ref} className={`hiddenCol ${className ?? ""}`} {...props}>
      {children}
    </th>
  )
);
ThHidden.displayName = "ThHidden";
