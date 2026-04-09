import type { ProfileFormData } from "../lib/didDocument";

interface Props {
  data: ProfileFormData;
  onChange: (data: ProfileFormData) => void;
}

export default function ProfileForm({ data, onChange }: Props) {
  const update = (field: keyof ProfileFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-2">
          Display Name
        </label>
        <input
          type="text"
          maxLength={64}
          value={data.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          placeholder="Your creator name"
          className="input-field"
        />
        <div className="text-xs text-guap-dim mt-1 text-right">{data.displayName.length}/64</div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-2">
          Description
        </label>
        <textarea
          maxLength={256}
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What do you create?"
          rows={3}
          className="input-field resize-none"
        />
        <div className="text-xs text-guap-dim mt-1 text-right">{data.description.length}/256</div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-2">
          HAP Creator ID
          <span className="ml-2 text-guap-dim normal-case font-normal">links your HAP authorship records</span>
        </label>
        <input
          type="text"
          value={data.hapCreatorId}
          onChange={(e) => update("hapCreatorId", e.target.value)}
          placeholder="hap_creator_001"
          className="input-field font-mono"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-2">
            Website URL
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://yoursite.com"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-guap-muted uppercase tracking-wider mb-2">
            Twitter / X Handle
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-guap-muted text-sm">@</span>
            <input
              type="text"
              value={data.twitter}
              onChange={(e) => update("twitter", e.target.value.replace("@", ""))}
              placeholder="handle"
              className="input-field pl-7"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
