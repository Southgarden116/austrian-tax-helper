import { FormattedMessage } from "react-intl";

export function FormActions({
  onSave,
  onCancel,
  saveDisabled = false,
}: {
  onSave: () => void;
  onCancel: () => void;
  saveDisabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        className="btn-primary disabled:opacity-50"
        onClick={onSave}
        disabled={saveDisabled}
      >
        <FormattedMessage id="common.save" />
      </button>
      <button className="btn-secondary" onClick={onCancel}>
        <FormattedMessage id="common.cancel" />
      </button>
    </div>
  );
}
