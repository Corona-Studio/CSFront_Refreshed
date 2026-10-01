"use client";
import {
    type ReactElement,
    type ReactNode,
    cloneElement,
    createContext,
    forwardRef,
    isValidElement,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef
} from "react";
import { Controller, FormProvider, useFormContext, useForm as useReactHookForm } from "react-hook-form";

import { Checkbox } from "./controls";

export type FieldValidator = (value: unknown) => boolean | Promise<boolean>;
export interface FieldRule {
    required?: boolean;
    whitespace?: boolean;
    pattern?: RegExp;
    validator?: FieldValidator;
    message?: string;
    type?: string;
    email?: boolean;
    min?: number;
    max?: number;
}
export interface FormController {
    reset: () => void;
    setFieldsValue: (values: Record<string, unknown>) => void;
    getFieldValue: (name: string) => unknown;
}
export interface FormProps {
    children?: ReactNode;
    className?: string;
    onSubmit?: (event: { validateResult: true | Record<string, unknown>; fields: Record<string, unknown> }) => void;
}
const FormMode = createContext(false);
const FormRoot = forwardRef<FormController, FormProps>(function FormRoot({ children, className, onSubmit }, ref) {
    const methods = useReactHookForm<Record<string, unknown>>({ mode: "onBlur" });
    useImperativeHandle(
        ref,
        () => ({
            reset: () => methods.reset(),
            setFieldsValue: (values) => {
                Object.entries(values).forEach(([name, value]) => methods.setValue(name, value));
            },
            getFieldValue: (name) => methods.getValues(name)
        }),
        [methods]
    );
    return (
        <FormProvider {...methods}>
            <FormMode value={true}>
                <form
                    noValidate
                    className={className}
                    onSubmit={methods.handleSubmit(
                        (fields) => onSubmit?.({ validateResult: true, fields }),
                        (errors) => onSubmit?.({ validateResult: errors, fields: methods.getValues() })
                    )}
                    onReset={() => methods.reset()}>
                    {children}
                </form>
            </FormMode>
        </FormProvider>
    );
});
export const Form = FormRoot;
export interface FormItemProps {
    name?: string;
    label?: ReactNode;
    children?: ReactNode;
    rules?: FieldRule[];
    initialData?: unknown;
    className?: string;
}
export function FormItem({ name, label, children, rules = [], initialData, className }: FormItemProps) {
    const context = useFormContext<Record<string, unknown>>();
    const inside = useContext(FormMode);
    const setValue = context?.setValue;
    const initialized = useRef(false);
    useEffect(() => {
        if (name && initialData != null && !initialized.current) {
            setValue?.(name, initialData);
            initialized.current = true;
        }
    }, [name, initialData, setValue]);
    if (!inside || !name || !isValidElement(children)) return <div className={className}>{children}</div>;
    const element = children as ReactElement<{
        id?: string;
        placeholder?: string;
        value?: unknown;
        checked?: unknown;
        onBlur?: () => void;
        ref?: React.Ref<unknown>;
        "aria-invalid"?: boolean;
        "aria-describedby"?: string;
        onChange?: (value: unknown) => void;
    }>;
    const id = `field-${name}`;
    return (
        <Controller
            name={name}
            control={context.control}
            defaultValue={initialData ?? (element.type === Checkbox ? false : "")}
            rules={{
                validate: async (value) => {
                    for (const rule of rules) {
                        const text = String(value ?? "");
                        const message = rule.message ?? "Invalid value";
                        if (rule.required && (value == null || text === "" || value === false)) return message;
                        if (rule.whitespace && text.trim() === "") return message;
                        if (rule.pattern && text && !rule.pattern.test(text)) return message;
                        if (rule.email && text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return message;
                        if (rule.min != null && text.length < rule.min) return message;
                        if (rule.max != null && text.length > rule.max) return message;
                        if (rule.validator && !(await rule.validator(value))) return message;
                    }
                    return true;
                }
            }}
            render={({ field, fieldState }) => (
                <div className={className ?? "mb-5"}>
                    {element.type !== Checkbox && (
                        <label htmlFor={id} className="block mb-2 text-xs font-semibold tracking-wide">
                            {label ?? element.props.placeholder ?? name}
                        </label>
                    )}
                    {cloneElement(element, {
                        id,
                        ...(element.type === Checkbox ? { checked: field.value } : { value: field.value }),
                        onChange: field.onChange,
                        onBlur: field.onBlur,
                        ref: field.ref,
                        "aria-invalid": fieldState.invalid,
                        "aria-describedby": fieldState.error ? `${id}-error` : undefined
                    } as Partial<typeof element.props>)}
                    {fieldState.error && (
                        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-destructive">
                            {fieldState.error.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
}
