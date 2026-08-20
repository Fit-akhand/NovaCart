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

        <section className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-surface)] p-5 sm:p-6">

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                    <div className="flex items-center gap-2">

                        <MapPin size={18} />

                        <h2 className="text-lg font-semibold">
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
                    className="flex items-center gap-2 rounded-lg bg-[var(--nova-blue)] px-4 py-2.5 text-sm font-semibold text-white"
                >
                    <Plus size={16} />
                    Add Address
                </button>

            </div>


            {error && (

                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>

            )}


            {success && (

                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                    {success}
                </div>

            )}


            {/* ADDRESS FORM */}

            {showForm && (

                <form
                    onSubmit={handleSubmit}
                    className="mt-6 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-soft)] p-4 sm:p-5"
                >

                    <h3 className="mb-5 text-base font-semibold">
                        {editingId
                            ? 'Edit Address'
                            : 'Add New Address'}
                    </h3>


                    <div className="grid gap-4 sm:grid-cols-2">

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Address type
                            </label>

                            <select
                                name="label"
                                value={form.label}
                                onChange={handleChange}
                                className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm outline-none"
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

                            <label className="mb-2 block text-sm font-medium">
                                Full name
                            </label>

                            <input
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Full name"
                                className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm outline-none"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Phone
                            </label>

                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="10-digit phone"
                                inputMode="numeric"
                                className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm outline-none"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Pincode
                            </label>

                            <input
                                name="pincode"
                                value={form.pincode}
                                onChange={handleChange}
                                placeholder="6-digit pincode"
                                inputMode="numeric"
                                className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm outline-none"
                            />

                        </div>


                        <div className="sm:col-span-2">

                            <label className="mb-2 block text-sm font-medium">
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="House number, street, locality"
                                className="w-full resize-none rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 py-3 text-sm outline-none"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                City
                            </label>

                            <input
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm outline-none"
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                State
                            </label>

                            <input
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="h-11 w-full rounded-lg border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 text-sm outline-none"
                            />

                        </div>

                    </div>


                    <label className="mt-4 flex items-center gap-2 text-sm">

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
                            className="rounded-lg bg-[var(--nova-blue)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
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
                            className="rounded-lg border border-[var(--nova-border)] px-5 py-2.5 text-sm font-semibold"
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
                        className="rounded-xl border border-[var(--nova-border)] p-4"
                    >

                        <div className="flex items-start justify-between gap-3">

                            <div>

                                <div className="flex items-center gap-2">

                                    <h3 className="font-semibold">
                                        {item.label}
                                    </h3>

                                    {item.isDefault && (

                                        <span className="flex items-center gap-1 rounded-full bg-[var(--nova-surface-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--nova-blue)]">

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


                        <div className="mt-4 flex gap-2">

                            <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="flex items-center gap-1.5 rounded-lg border border-[var(--nova-border)] px-3 py-2 text-xs font-semibold"
                            >
                                <Pencil size={13} />
                                Edit
                            </button>


                            <button
                                type="button"
                                onClick={() => handleDelete(item._id)}
                                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                            >
                                <Trash2 size={13} />
                                Delete
                            </button>

                        </div>

                    </div>

                ))}

            </div>


            {addresses.length === 0 && !showForm && (

                <div className="mt-6 rounded-xl border border-dashed border-[var(--nova-border)] p-8 text-center">

                    <MapPin
                        size={25}
                        className="mx-auto text-[var(--nova-muted)]"
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