"use client";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    Dialog as DialogRoot,
    DialogTitle
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { TooltipContent, Tooltip as TooltipRoot, TooltipTrigger } from "@/components/ui/tooltip";
import i18n from "@/i18n";
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import type { CSSProperties, ComponentProps, ReactNode } from "react";
import { toast } from "sonner";

type Theme = "default" | "primary" | "danger" | "success" | "warning" | "error" | "info";
export interface ButtonProps extends Omit<ComponentProps<"button">, "size"> {
    theme?: Theme;
    variant?: "base" | "outline" | "text" | "dashed";
    size?: "small" | "medium" | "large";
    shape?: "square" | "round";
    icon?: ReactNode;
    loading?: boolean;
    block?: boolean;
    href?: string;
    target?: string;
}
export function Button({
    theme = "primary",
    variant = "base",
    size = "medium",
    shape,
    icon,
    loading,
    block,
    href,
    target,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const styles = cn(
        "font-semibold uppercase tracking-wide rounded-none",
        block && "w-full",
        shape === "square" && "px-3",
        className
    );
    const tone =
        variant === "text"
            ? "ghost"
            : variant === "outline" || variant === "dashed"
              ? "outline"
              : theme === "danger"
                ? "destructive"
                : theme === "default"
                  ? "secondary"
                  : "default";
    const content = (
        <>
            {loading ? <Loader2 className="animate-spin size-4" /> : icon}
            {children}
        </>
    );
    if (href)
        return (
            <ShadcnButton
                asChild
                variant={tone}
                size={size === "large" ? "lg" : size === "small" ? "sm" : "default"}
                className={styles}>
                <a href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}>
                    {content}
                </a>
            </ShadcnButton>
        );
    return (
        <ShadcnButton
            {...props}
            type={props.type ?? "button"}
            variant={tone}
            size={size === "large" ? "lg" : size === "small" ? "sm" : "default"}
            className={styles}
            disabled={disabled || loading}
            aria-busy={loading || undefined}>
            {content}
        </ShadcnButton>
    );
}
export interface InputProps extends Omit<ComponentProps<"input">, "onChange" | "size" | "value"> {
    value?: string | number | null;
    onChange?: (value: string) => void;
    prefixIcon?: ReactNode;
    suffix?: ReactNode;
    clearable?: boolean;
    maxlength?: number;
    size?: "small" | "medium" | "large";
    status?: string;
    tips?: ReactNode;
}
export function Input({
    value,
    onChange,
    prefixIcon,
    suffix,
    clearable,
    maxlength,
    size: _size,
    status,
    tips,
    className,
    ...props
}: InputProps) {
    return (
        <div className={cn("relative min-w-0", className)}>
            {prefixIcon && (
                <span className="absolute left-3 top-3 pointer-events-none [&>svg]:size-4 text-muted-foreground">
                    {prefixIcon}
                </span>
            )}
            <ShadcnInput
                {...props}
                value={value ?? ""}
                maxLength={maxlength ?? props.maxLength}
                onChange={(e) => onChange?.(e.target.value)}
                aria-invalid={status === "error" || props["aria-invalid"]}
                className={cn(
                    "rounded-none h-11 bg-background",
                    prefixIcon && "pl-10",
                    (clearable || suffix) && "pr-10"
                )}
            />
            {clearable && value && !props.disabled && (
                <button
                    type="button"
                    aria-label={i18n.t("clear")}
                    className="absolute right-3 top-3"
                    onClick={() => onChange?.("")}>
                    <X className="size-4" />
                </button>
            )}
            {suffix}
            {tips && <p className="mt-1 text-xs text-muted-foreground">{tips}</p>}
        </div>
    );
}
export interface TextareaProps extends Omit<ComponentProps<"textarea">, "onChange" | "value"> {
    value?: string;
    onChange?: (value: string) => void;
    maxlength?: number;
    autosize?: { minRows?: number; maxRows?: number };
    status?: string;
    tips?: ReactNode;
}
export function Textarea({ onChange, maxlength, autosize, status, tips, ...props }: TextareaProps) {
    return (
        <>
            <ShadcnTextarea
                {...props}
                maxLength={maxlength}
                rows={autosize?.minRows ?? 4}
                onChange={(e) => onChange?.(e.target.value)}
                aria-invalid={status === "error"}
            />
            {tips && <p className="text-xs text-destructive">{tips}</p>}
        </>
    );
}
export function Checkbox({
    children,
    checked = false,
    onChange,
    disabled,
    id,
    onBlur,
    ref
}: {
    children?: ReactNode;
    checked?: boolean;
    onChange?: (value: boolean) => void;
    disabled?: boolean;
    id?: string;
    onBlur?: () => void;
    ref?: React.Ref<HTMLButtonElement>;
}) {
    return (
        <label className="flex items-center gap-3 text-sm">
            <ShadcnCheckbox
                ref={ref}
                onBlur={onBlur}
                id={id}
                disabled={disabled}
                checked={checked}
                onCheckedChange={(value) => onChange?.(value === true)}
            />
            {children}
        </label>
    );
}
export interface DialogProps {
    children?: ReactNode;
    visible?: boolean;
    header?: ReactNode;
    theme?: Theme;
    confirmLoading?: boolean;
    confirmBtn?: string | { content?: ReactNode; theme?: Theme; loading?: boolean; disabled?: boolean };
    cancelBtn?: string | null;
    closeOnOverlayClick?: boolean;
    closeOnEscKeydown?: boolean;
    onConfirm?: () => void | Promise<void>;
    onClose?: () => void;
    onCancel?: () => void;
    width?: number | string;
    footer?: ReactNode;
}
export function Dialog({
    visible,
    header,
    children,
    theme,
    confirmLoading,
    confirmBtn,
    cancelBtn,
    onConfirm,
    onClose,
    onCancel,
    closeOnOverlayClick = true,
    closeOnEscKeydown = true,
    width,
    footer
}: DialogProps) {
    const confirm = typeof confirmBtn === "object" ? confirmBtn?.content : confirmBtn;
    return (
        <DialogRoot
            open={visible ?? false}
            onOpenChange={(open) => {
                if (!open && !confirmLoading) onClose?.();
            }}>
            <DialogContent
                className="rounded-none border-border bg-card"
                style={width ? { width, maxWidth: "calc(100vw - 32px)" } : undefined}
                onPointerDownOutside={(e) => {
                    if (!closeOnOverlayClick || confirmLoading) e.preventDefault();
                }}
                onEscapeKeyDown={(e) => {
                    if (confirmLoading || !closeOnEscKeydown) e.preventDefault();
                }}>
                <DialogHeader>
                    <p className="m-kicker">CS / CONFIRM ACTION</p>
                    <DialogTitle>{header}</DialogTitle>
                    <DialogDescription className="sr-only">{i18n.t("confirm")}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">{children}</div>
                {footer ?? (
                    <DialogFooter>
                        {cancelBtn !== null && (
                            <Button
                                theme="default"
                                variant="outline"
                                disabled={confirmLoading}
                                onClick={onCancel ?? onClose}>
                                {cancelBtn ?? i18n.t("cancel")}
                            </Button>
                        )}
                        <Button
                            theme={theme === "danger" || theme === "warning" ? "danger" : "primary"}
                            loading={confirmLoading || (typeof confirmBtn === "object" && confirmBtn?.loading) || false}
                            disabled={typeof confirmBtn === "object" ? confirmBtn?.disabled : undefined}
                            onClick={() => void onConfirm?.()}>
                            {confirm ?? i18n.t("confirm")}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </DialogRoot>
    );
}
export interface DropdownOption {
    content?: ReactNode;
    value?: string | number;
    disabled?: boolean;
    prefixIcon?: ReactNode;
    active?: boolean;
}
export function Dropdown({
    children,
    options = [],
    onClick
}: {
    children: ReactNode;
    options?: DropdownOption[];
    onClick?: (option: DropdownOption) => void;
    minColumnWidth?: number;
    maxColumnWidth?: number;
    trigger?: string;
    placement?: string;
    direction?: string;
    hideAfterItemClick?: boolean;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none">
                {options.map((o, index) => (
                    <DropdownMenuItem
                        key={String(o.value ?? index)}
                        disabled={o.disabled}
                        onSelect={() => onClick?.(o)}
                        className={cn(o.active && "bg-accent text-accent-foreground")}>
                        {o.prefixIcon}
                        {o.content}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
export function Select({
    value,
    options,
    onChange,
    disabled,
    className
}: {
    value?: string | number;
    options: { label: ReactNode; value: string | number }[];
    onChange?: (value: string | number) => void;
    disabled?: boolean;
    className?: string;
    size?: string;
}) {
    return (
        <select
            aria-label={i18n.t("select")}
            value={value}
            disabled={disabled}
            onChange={(e) => {
                const option = options.find((o) => String(o.value) === e.target.value);
                if (option) onChange?.(option.value);
            }}
            className={cn("h-11 border border-input bg-background px-3 text-sm", className)}>
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    );
}
export function Tooltip({
    children,
    content
}: {
    children: ReactNode;
    content?: ReactNode;
    zIndex?: number;
    attach?: string;
    trigger?: string;
    theme?: string;
    placement?: string;
    overlayClassName?: string;
}) {
    return (
        <TooltipRoot>
            <TooltipTrigger asChild>
                <div>{children}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm rounded-none">{content}</TooltipContent>
        </TooltipRoot>
    );
}
export function Tag({
    children,
    theme,
    className
}: {
    children?: ReactNode;
    theme?: Theme;
    variant?: string;
    className?: string;
    size?: string;
}) {
    return (
        <ShadcnBadge
            variant="outline"
            className={cn(
                "rounded-none font-mono",
                theme === "danger" || theme === "error"
                    ? "text-destructive"
                    : theme === "success"
                      ? "text-success"
                      : "",
                className
            )}>
            {children}
        </ShadcnBadge>
    );
}
export function Badge({
    children,
    count
}: {
    children?: ReactNode;
    count?: ReactNode;
    color?: string;
    size?: string;
    offset?: number[];
    shape?: string;
}) {
    return (
        <span className="inline-flex items-center gap-2">
            {children}
            {count != null && <Tag>{count}</Tag>}
        </span>
    );
}
export interface Notice {
    title?: ReactNode;
    content?: ReactNode;
    duration?: number;
    placement?: string;
    offset?: number[];
    closeBtn?: boolean;
    attach?: () => Document;
}
export const notify = {
    success: async ({ title, content, duration }: Notice) => {
        toast.success(title, { description: content, duration });
    },
    error: async ({ title, content, duration }: Notice) => {
        toast.error(title, { description: content, duration });
    },
    info: async ({ title, content, duration }: Notice) => {
        toast.info(title, { description: content, duration });
    },
    warning: async ({ title, content, duration }: Notice) => {
        toast.warning(title, { description: content, duration });
    }
};
export type { CSSProperties, ReactNode };
