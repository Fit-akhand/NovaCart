import { useEffect, useState } from 'react'
import {
    MapPin,
    Plus,
    Pencil,
    Trash2,
    Check
} from 'lucide-react'

import { getData, postData, putData, deleteData } from '@/lib/api-client'


const emptyAddress = {
    label: 'Home',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
}


const AddressManager = ({ token }) => {

    const [addresses, setAddresses] = useState([])

    const [form, setForm] = useState(emptyAddress)

    const [editingId, setEditingId] = useState(null)

    const [showForm, setShowForm] = useState(false)

    const [loading, setLoading] = useState(false)

    const [error, setError] = useState('')

    const [success, setSuccess] = useState('')


    const loadAddresses = async () => {

        const res = await getData(
            'address',
            token
        )

        if (res.err) {

            setError(res.err)

            return
        }

        setAddresses(
            res.addresses || []
        )
    }


    useEffect(() => {

        if (token) {
            loadAddresses()
        }

    }, [token])


    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target

        setForm(prev => ({
            ...prev,
            [name]:
                type === 'checkbox'
                    ? checked
                    : value
        }))

        setError('')
        setSuccess('')
    }


    const openCreate = () => {

        setEditingId(null)

        setForm(emptyAddress)

        setShowForm(true)

        setError('')
        setSuccess('')
    }


    const openEdit = (item) => {

        setEditingId(item._id)

        setForm({
            label: item.label || 'Home',
            fullName: item.fullName || '',
            phone: item.phone || '',
            address: item.address || '',
            city: item.city || '',
            state: item.state || '',
            pincode: item.pincode || '',
            isDefault: Boolean(item.isDefault)
        })

        setShowForm(true)

        setError('')
        setSuccess('')
    }


    const handleSubmit = async (e) => {

        e.preventDefault()

        setLoading(true)

        setError('')
        setSuccess('')


        const res = editingId
            ? await putData(
                `address/${editingId}`,
                form,
                token
            )
            : await postData(
                'address',
                form,
                token
            )


        if (res.err) {

            setError(res.err)

            setLoading(false)

            return
        }


        setSuccess(
            editingId
                ? 'Address updated successfully.'
                : 'Address added successfully.'
        )


        setShowForm(false)

        setEditingId(null)

        setForm(emptyAddress)

        await loadAddresses()

        setLoading(false)
    }


    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                'Delete this address?'
            )

        if (!confirmed) return


        const res = await deleteData(
            `address/${id}`,
            token
        )


        if (res.err) {

            setError(res.err)

            return
        }


        setSuccess(
            'Address deleted successfully.'
        )

        await loadAddresses()
    }


    return (

        <section className="rounded-3xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 shadow-[var(--shadow-md)] sm:p-6">

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                    <div className="flex items-center gap-2">

                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--nova-lavender-soft)] text-[var(--nova-primary)]">
                            <MapPin size={18} />
                        </span>

                        <h2 className="text-lg font-bold tracking-tight text-[var(--nova-text)]">
                            Saved Addresses
                        </h2>

                    </div>

                    <p className="mt-1 text-sm text-[var(--nova-muted)]">
                        Manage your delivery addresses.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center gap-2 rounded-xl bg-[var(--nova-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(124,58,237,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(124,58,237,0.22)]"
                >
                    <Plus size={16} />
                    Add Address
                </button>

            </div>


            {error && (

                <div className="mt-4 rounded-xl border border-[rgba(239,68,68,0.18)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm font-medium text-[var(--nova-danger)]">
                    {error}
                </div>

            )}


            {success && (

                <div className="mt-4 rounded-xl border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.08)] px-4 py-3 text-sm font-medium text-[var(--nova-success)]">
                    {success}
                </div>

            )}


            {/* ADDRESS FORM */}

            {showForm && (

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
                >

                    <h3 className="mb-5 text-base font-bold tracking-tight text-[var(--nova-text)]">
                        {editingId
                            ? 'Edit Address'
                            : 'Add New Address'}
                    </h3>


                    <div className="grid gap-4 sm:grid-cols-2">

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-[var(--nova-text)]">
                                Address type
                            </label>

                            <select
                                name="label"
                                value={form.label}
                                onChange={handleChange}
                                className="h-11 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                            >
                                <option value="Home">
                                    Home
                                </option>

                                <option value="Office">
                                    Office
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-[var(--nova-text)]">
                                Full name
                            </label>

                            <input
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Full name"
                                className="h-11 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-[var(--nova-text)]">
                                Phone
                            </label>

                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="10-digit phone"
                                inputMode="numeric"
                                className="h-11 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-[var(--nova-text)]">
                                Pincode
                            </label>

                            <input
                                name="pincode"
                                value={form.pincode}
                                onChange={handleChange}
                                placeholder="6-digit pincode"
                                inputMode="numeric"
                                className="h-11 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                            />

                        </div>


                        <div className="sm:col-span-2">

                            <label className="mb-2 block text-sm font-semibold text-[var(--nova-text)]">
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="House number, street, locality"
                                className="w-full resize-none rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 py-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-[var(--nova-text)]">
                                City
                            </label>

                            <input
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="h-11 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-semibold text-[var(--nova-text)]">
                                State
                            </label>

                            <input
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="h-11 w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm text-[var(--nova-text)] outline-none transition-all placeholder:text-[var(--nova-muted)] hover:border-[var(--nova-violet-light)] focus:border-[var(--nova-primary)] focus:ring-2 focus:ring-[rgba(139,92,246,0.12)]"
                            />

                        </div>

                    </div>


                    <label className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 py-2.5 text-sm text-[var(--nova-text)]">

                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={form.isDefault}
                            onChange={handleChange}
                        />

                        Make this my default address

                    </label>


                    <div className="mt-5 flex flex-wrap gap-3">

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-[var(--nova-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(124,58,237,0.16)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? 'Saving...'
                                : editingId
                                    ? 'Update Address'
                                    : 'Save Address'}
                        </button>


                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-5 py-2.5 text-sm font-bold text-[var(--nova-text)] transition-all hover:border-[var(--nova-violet-light)] hover:bg-[var(--nova-surface-soft)]"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            )}


            {/* ADDRESS LIST */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

                {addresses.map(item => (

                    <div
                        key={item._id}
                        className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-4 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[var(--nova-violet-light)] hover:shadow-[0_14px_30px_rgba(124,58,237,0.10)]"
                    >

                        <div className="flex items-start justify-between gap-3">

                            <div>

                                <div className="flex items-center gap-2">

                                    <h3 className="font-semibold">
                                        {item.label}
                                    </h3>

                                    {item.isDefault && (

                                        <span className="flex items-center gap-1 rounded-full bg-[var(--nova-lavender-soft)] px-2 py-1 text-[10px] font-bold text-[var(--nova-primary)]">

                                            <Check size={11} />

                                            Default

                                        </span>

                                    )}

                                </div>

                                <p className="mt-3 text-sm font-medium">
                                    {item.fullName}
                                </p>

                                <p className="mt-1 text-sm text-[var(--nova-muted)]">
                                    {item.phone}
                                </p>

                                <p className="mt-2 text-sm leading-5 text-[var(--nova-muted)]">
                                    {item.address}
                                    <br />
                                    {item.city}, {item.state}
                                    <br />
                                    {item.pincode}
                                </p>

                            </div>

                        </div>


                        <div className="mt-4 flex flex-wrap gap-2">

                            <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="flex items-center gap-1.5 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 py-2 text-xs font-bold text-[var(--nova-text)] transition-all hover:border-[var(--nova-violet-light)] hover:bg-[var(--nova-lavender-soft)] hover:text-[var(--nova-primary)]"
                            >
                                <Pencil size={13} />
                                Edit
                            </button>


                            <button
                                type="button"
                                onClick={() => handleDelete(item._id)}
                                className="flex items-center gap-1.5 rounded-xl border border-[rgba(239,68,68,0.18)] bg-[var(--nova-surface)] px-3 py-2 text-xs font-bold text-[var(--nova-danger)] transition-all hover:bg-[rgba(239,68,68,0.08)]"
                            >
                                <Trash2 size={13} />
                                Delete
                            </button>

                        </div>

                    </div>

                ))}

            </div>


            {addresses.length === 0 && !showForm && (

                <div className="mt-6 rounded-3xl border border-dashed border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-8 text-center shadow-[var(--shadow-sm)]">

                    <MapPin
                        size={25}
                        className="mx-auto text-[var(--nova-primary)]"
                    />

                    <p className="mt-3 text-sm font-medium">
                        No saved addresses
                    </p>

                    <p className="mt-1 text-xs text-[var(--nova-muted)]">
                        Add an address for faster checkout.
                    </p>

                </div>

            )}

        </section>
    )
}

export default AddressManager