import Input from '../common/Input'

const AddressCard = ({ item, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(item)}
    className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
      selected
        ? 'border-[var(--nova-primary)] bg-[var(--nova-lavender-soft)] ring-1 ring-[var(--nova-primary)]'
        : 'border-[var(--nova-border)] bg-[var(--nova-surface)] hover:border-[var(--nova-violet-light)]'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 text-sm">
        <p className="font-bold text-[var(--nova-text)]">
          {item.fullName}
          <span className="ml-2 text-xs font-medium text-[var(--nova-muted)]">
            {item.label || 'Home'}
          </span>
        </p>
        <p className="mt-1 leading-6 text-[var(--nova-muted)]">
          {item.address}, {item.city}, {item.state} - {item.pincode}
        </p>
        <p className="mt-1 text-[var(--nova-muted)]">{item.phone}</p>
      </div>
      {item.isDefault && (
        <span className="shrink-0 rounded-full bg-[var(--nova-lavender-soft)] px-3 py-1 text-xs font-semibold text-[var(--nova-primary)]">
          Default
        </span>
      )}
    </div>
  </button>
)

const AddressStep = ({
  savedAddresses,
  selectedAddressId,
  formOpen,
  address,
  onChange,
  onSelect,
  onAddNew,
  saveNew,
  onSaveNewChange,
}) => (
  <section className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
    <h2 className="text-lg font-bold tracking-tight text-[var(--nova-text)]">
      Delivery address
    </h2>
    <p className="mt-1 text-sm text-[var(--nova-muted)]">
      {savedAddresses.length > 0
        ? 'Choose where to deliver, or add a new address.'
        : 'Where should we deliver your order?'}
    </p>

    {savedAddresses.length > 0 && (
      <div className="mt-5 space-y-3">
        {savedAddresses.map((item) => (
          <AddressCard
            key={item._id}
            item={item}
            selected={selectedAddressId === item._id && !formOpen}
            onSelect={onSelect}
          />
        ))}
      </div>
    )}

    {savedAddresses.length > 0 && !formOpen && (
      <button
        type="button"
        onClick={onAddNew}
        className="mt-4 rounded-xl border border-dashed border-[var(--nova-violet-light)] px-4 py-2.5 text-sm font-semibold text-[var(--nova-primary)] hover:bg-[var(--nova-lavender-soft)]"
      >
        + Add new address
      </button>
    )}

    {formOpen && (
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input
          id="fullName"
          name="fullName"
          label="Full name"
          autoComplete="name"
          value={address.fullName}
          onChange={onChange}
        />
        <Input
          id="phone"
          name="phone"
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          placeholder="10-digit number"
          value={address.phone}
          onChange={onChange}
        />
        <div className="sm:col-span-2">
          <Input
            id="address"
            name="address"
            label="Address"
            autoComplete="street-address"
            placeholder="House number, street, area"
            value={address.address}
            onChange={onChange}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            id="addressLine2"
            name="addressLine2"
            label="Landmark / apartment (optional)"
            autoComplete="address-line2"
            value={address.addressLine2}
            onChange={onChange}
          />
        </div>
        <Input
          id="city"
          name="city"
          label="City"
          autoComplete="address-level2"
          value={address.city}
          onChange={onChange}
        />
        <Input
          id="state"
          name="state"
          label="State"
          autoComplete="address-level1"
          value={address.state}
          onChange={onChange}
        />
        <Input
          id="pincode"
          name="pincode"
          label="PIN code"
          inputMode="numeric"
          maxLength={6}
          autoComplete="postal-code"
          placeholder="6-digit PIN"
          value={address.pincode}
          onChange={onChange}
        />

        <label className="flex items-center gap-2 self-end rounded-xl border border-[var(--nova-border)] px-3 py-3 text-sm text-[var(--nova-text)]">
          <input
            type="checkbox"
            checked={saveNew}
            onChange={(e) => onSaveNewChange(e.target.checked)}
          />
          Save to my profile
        </label>
      </div>
    )}
  </section>
)

export default AddressStep
