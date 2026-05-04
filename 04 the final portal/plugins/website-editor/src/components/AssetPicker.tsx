// Asset picker — media browser used by image/video/icon block editors
// and the asset library admin page. Round-1 stub. Round-2 lifts the
// full implementation from `02/src/components/editor/AssetPicker.tsx`.
//
// Cross-team note: also used by future blog/forms/ecommerce plugins;
// candidate for promotion to foundation `components/shared/` later.

export interface AssetPickerProps {
  value?: string;
  onChange?: (url: string) => void;
  accept?: "image" | "video" | "any";
}

export function AssetPicker({ value, onChange, accept }: AssetPickerProps) {
  return (
    <div data-asset-picker data-accept={accept ?? "any"}>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Paste asset URL or click browse"
        style={{ width: "100%", padding: 8 }}
      />
    </div>
  );
}
