import Head from 'next/head'
import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
    Plus,
    Edit,
    Trash2,
    Image as ImageIcon,
    Upload,
    X,
    Save,
    Eye,
    EyeOff,
    GripVertical
} from 'lucide-react'

import { DataContext } from '../../../store/GlobalState'
import {
    getData,
    postData,
    putData,
    deleteData
} from '../../lib/api-client'

import Container from '../../../components/common/Container'
import Button from '../../../components/common/Button'
import Loading from '../../../components/common/Loading'
import EmptyState from '../../../components/common/EmptyState'

import { imageUpload } from '../../../utils/imageUpload'


const Heroes = () => {

    const { state, dispatch } =
        useContext(DataContext)

    const { auth } = state

    const router = useRouter()


    // ==========================================
    // STATE
    // ==========================================

    const [heroes, setHeroes] =
        useState([])

    const [loading, setLoading] =
        useState(true)

    const [saving, setSaving] =
        useState(false)

    const [showForm, setShowForm] =
        useState(false)

    const [editingId, setEditingId] =
        useState('')

    const [image, setImage] =
        useState(null)

    const [imagePreview, setImagePreview] =
        useState('')

    const [title, setTitle] =
        useState('')

    const [subtitle, setSubtitle] =
        useState('')

    const [buttonText, setButtonText] =
        useState('Shop Now')

    const [buttonLink, setButtonLink] =
        useState('/products')

    const [isActive, setIsActive] =
        useState(true)

    const [order, setOrder] =
        useState(0)


    // ==========================================
    // ADMIN CHECK
    // ==========================================

    useEffect(() => {

        if (!auth?.user) {
            return
        }

        if (
            auth.user.role !== 'admin' ||
            auth.user.root !== true
        ) {

            router.replace('/')

            return
        }

    }, [auth?.user])


    // ==========================================
    // LOAD HEROES
    // ==========================================

    useEffect(() => {

        if (!auth?.token) {
            return
        }

        const loadHeroes = async () => {

            try {

                setLoading(true)

                const response =
                    await getData(
                        'heroes',
                        auth.token
                    )

                if (response?.err) {

                    dispatch({
                        type: 'NOTIFY',
                        payload: {
                            error: response.err
                        }
                    })

                    setHeroes([])

                    return
                }

                setHeroes(
                    Array.isArray(
                        response?.heroes
                    )
                        ? response.heroes
                        : []
                )

            } catch (error) {

                console.error(
                    'Load heroes error:',
                    error
                )

                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        error:
                            'Unable to load hero banners.'
                    }
                })

                setHeroes([])

            } finally {

                setLoading(false)

            }
        }

        loadHeroes()

    }, [auth?.token])


    // ==========================================
    // RESET FORM
    // ==========================================

    const resetForm = () => {

        setEditingId('')

        setImage(null)

        setImagePreview('')

        setTitle('')

        setSubtitle('')

        setButtonText('Shop Now')

        setButtonLink('/products')

        setIsActive(true)

        setOrder(0)

    }


    // ==========================================
    // OPEN CREATE FORM
    // ==========================================

    const openCreateForm = () => {

        resetForm()

        setShowForm(true)

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }


    // ==========================================
    // EDIT HERO
    // ==========================================

    const editHero = (hero) => {

        setEditingId(hero._id)

        setImage(null)

        setImagePreview(
            hero.image || ''
        )

        setTitle(
            hero.title || ''
        )

        setSubtitle(
            hero.subtitle || ''
        )

        setButtonText(
            hero.buttonText || 'Shop Now'
        )

        setButtonLink(
            hero.buttonLink || '/products'
        )

        setIsActive(
            Boolean(hero.isActive)
        )

        setOrder(
            Number(hero.order) || 0
        )

        setShowForm(true)

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }


    // ==========================================
    // IMAGE CHANGE
    // ==========================================

    const handleImageChange = (e) => {

        const file =
            e.target.files?.[0]

        if (!file) {
            return
        }

        if (file.size > 2 * 1024 * 1024) {

            return dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        'Hero image must be smaller than 2MB.'
                }
            })
        }

        if (
            file.type !== 'image/jpeg' &&
            file.type !== 'image/png' &&
            file.type !== 'image/webp'
        ) {

            return dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        'Please select a JPG, PNG or WebP image.'
                }
            })
        }

        setImage(file)

        setImagePreview(
            URL.createObjectURL(file)
        )
    }


    // ==========================================
    // REMOVE SELECTED IMAGE
    // ==========================================

    const removeImage = () => {

        setImage(null)

        setImagePreview(
            editingId
                ? heroes.find(
                    hero =>
                        hero._id === editingId
                )?.image || ''
                : ''
        )
    }


    // ==========================================
    // SAVE HERO
    // ==========================================

    const saveHero = async (e) => {

        e.preventDefault()

        if (!auth?.token) {

            return dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        'Authentication is not valid.'
                }
            })
        }


        // ======================================
        // IMAGE REQUIRED FOR CREATE
        // ======================================

        if (
            !editingId &&
            !(image instanceof File)
        ) {

            return dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        'Please upload a hero image.'
                }
            })
        }


        if (
            !title.trim() &&
            !subtitle.trim()
        ) {

            return dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        'Please add a title or subtitle.'
                }
            })
        }


        setSaving(true)

        dispatch({
            type: 'NOTIFY',
            payload: {
                loading: true
            }
        })


        try {

            // ==================================
            // UPLOAD IMAGE
            // ==================================

            let imageUrl

            if (image instanceof File) {

                const media =
                    await imageUpload([
                        image
                    ])

                if (
                    !media ||
                    !media[0] ||
                    !media[0].url
                ) {

                    throw new Error(
                        'Hero image upload failed.'
                    )
                }

                imageUrl =
                    media[0].url
            }


            // ==================================
            // PAYLOAD
            // ==================================

            const payload = {

                title:
                    title.trim(),

                subtitle:
                    subtitle.trim(),

                buttonText:
                    buttonText.trim() ||
                    'Shop Now',

                buttonLink:
                    buttonLink.trim() ||
                    '/products',

                isActive:
                    Boolean(isActive),

                order:
                    Number(order) || 0
            }


            // Only replace image when
            // a new image was selected.

            if (
                imageUrl !== undefined
            ) {

                payload.image =
                    imageUrl
            }


            // ==================================
            // UPDATE
            // ==================================

            if (editingId) {

                const response =
                    await putData(
                        `heroes/${editingId}`,
                        payload,
                        auth.token
                    )

                if (response?.err) {

                    throw new Error(
                        response.err
                    )
                }

                setHeroes(
                    previous =>
                        previous.map(
                            hero =>
                                hero._id ===
                                editingId
                                    ? response.hero
                                    : hero
                        )
                )


                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        success:
                            'Hero banner updated successfully.'
                    }
                })

            }


            // ==================================
            // CREATE
            // ==================================

            else {

                const response =
                    await postData(
                        'heroes',
                        payload,
                        auth.token
                    )

                if (response?.err) {

                    throw new Error(
                        response.err
                    )
                }

                setHeroes(
                    previous => [
                        ...previous,
                        response.hero
                    ]
                )


                dispatch({
                    type: 'NOTIFY',
                    payload: {
                        success:
                            'Hero banner created successfully.'
                    }
                })

            }


            resetForm()

            setShowForm(false)


        } catch (error) {

            console.error(
                'Save hero error:',
                error
            )

            dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        error.message ||
                        'Unable to save hero banner.'
                }
            })

        } finally {

            setSaving(false)

            dispatch({
                type: 'NOTIFY',
                payload: {
                    loading: false
                }
            })

        }
    }


    // ==========================================
    // DELETE HERO
    // ==========================================

    const handleDelete = async (hero) => {

        if (!hero) {
            return
        }

        const confirmed =
            window.confirm(
                `Delete "${hero.title || 'this hero banner'}"?\n\nThis action cannot be undone.`
            )

        if (!confirmed) {
            return
        }


        try {

            const response =
                await deleteData(
                    `heroes/${hero._id}`,
                    auth.token
                )

            if (response?.err) {

                throw new Error(
                    response.err
                )
            }


            setHeroes(
                previous =>
                    previous.filter(
                        item =>
                            item._id !==
                            hero._id
                    )
            )


            dispatch({
                type: 'NOTIFY',
                payload: {
                    success:
                        'Hero banner deleted successfully.'
                }
            })

        } catch (error) {

            console.error(
                'Delete hero error:',
                error
            )

            dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        error.message ||
                        'Unable to delete hero banner.'
                }
            })
        }
    }


    // ==========================================
    // TOGGLE ACTIVE
    // ==========================================

    const toggleActive = async (hero) => {

        try {

            const response =
                await putData(
                    `heroes/${hero._id}`,
                    {
                        isActive:
                            !hero.isActive
                    },
                    auth.token
                )

            if (response?.err) {

                throw new Error(
                    response.err
                )
            }

            setHeroes(
                previous =>
                    previous.map(
                        item =>
                            item._id ===
                            hero._id
                                ? response.hero
                                : item
                    )
            )

        } catch (error) {

            dispatch({
                type: 'NOTIFY',
                payload: {
                    error:
                        error.message ||
                        'Unable to update hero status.'
                }
            })
        }
    }


    // ==========================================
    // LOADING
    // ==========================================

    if (
        loading &&
        !heroes.length
    ) {

        return (
            <Loading />
        )
    }


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <>
            <Head>

                <title>
                    Hero Banners | NovaCart
                </title>

                <meta
                    name="description"
                    content="Manage the images and content displayed on the NovaCart home page."
                />

            </Head>


            <main
                className="
                    min-h-screen
                    bg-[var(--nova-bg)]
                    p-5
                    sm:p-7
                    lg:p-8
                "
            >

                <Container
                    className="
                        max-w-7xl
                    "
                >

                    {/* ====================================
                        HEADER
                    ==================================== */}

                    <div
                        className="
                            mb-7
                            flex
                            flex-col
                            gap-4

                            sm:flex-row
                            sm:items-end
                            sm:justify-between
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-[0.18em]
                                    text-[var(--nova-primary)]
                                "
                            >
                                Homepage
                            </p>

                            <h1
                                className="
                                    mt-1
                                    text-2xl
                                    font-bold
                                    tracking-tight
                                    text-[var(--nova-text)]

                                    sm:text-3xl
                                "
                            >
                                Hero Banners
                            </h1>

                            <p
                                className="
                                    mt-2
                                    max-w-2xl
                                    text-sm
                                    leading-6
                                    text-[var(--nova-muted)]
                                "
                            >
                                Manage the images and content
                                displayed on the NovaCart home page.
                            </p>

                        </div>


                        {!showForm && (

                            <Button
                                onClick={
                                    openCreateForm
                                }
                            >
                                <Plus size={16} />

                                Add Hero Banner
                            </Button>

                        )}

                    </div>


                    {/* ====================================
                        FORM
                    ==================================== */}

                    {showForm && (

                        <form
                            onSubmit={saveHero}
                            className="
                                mb-8
                                overflow-hidden

                                rounded-3xl

                                border
                                border-[var(--nova-border)]

                                bg-[var(--nova-surface)]

                                shadow-[var(--shadow-sm)]
                            "
                        >

                            {/* FORM HEADER */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    border-b
                                    border-[var(--nova-border)]
                                    px-5
                                    py-4

                                    sm:px-6
                                "
                            >

                                <div>

                                    <h2
                                        className="
                                            text-base
                                            font-semibold
                                            text-[var(--nova-text)]
                                        "
                                    >
                                        {editingId
                                            ? 'Edit Hero Banner'
                                            : 'Create Hero Banner'}
                                    </h2>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-[var(--nova-muted)]
                                        "
                                    >
                                        {editingId
                                            ? 'Update the banner displayed on the homepage.'
                                            : 'Create a new homepage banner.'}
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm()
                                        setShowForm(false)
                                    }}
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-xl

                                        text-[var(--nova-muted)]

                                        hover:bg-[var(--nova-surface-soft)]
                                        hover:text-[var(--nova-text)]
                                    "
                                >
                                    <X size={18} />
                                </button>

                            </div>


                            <div
                                className="
                                    grid
                                    gap-6
                                    p-5

                                    lg:grid-cols-[0.9fr_1.1fr]

                                    sm:p-6
                                "
                            >

                                {/* =================================
                                    IMAGE
                                ================================= */}

                                <div>

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-xs
                                            font-semibold
                                            text-[var(--nova-text)]
                                        "
                                    >
                                        Hero Image
                                    </label>


                                    <div
                                        className="
                                            relative
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-[var(--nova-border)]
                                            bg-[var(--nova-surface-soft)]
                                        "
                                    >

                                        {imagePreview ? (

                                            <>
                                                <img
                                                    src={imagePreview}
                                                    alt="Hero preview"
                                                    className="
                                                        aspect-[16/7]
                                                        w-full
                                                        object-cover
                                                    "
                                                />

                                                <button
                                                    type="button"
                                                    onClick={
                                                        removeImage
                                                    }
                                                    className="
                                                        absolute
                                                        right-3
                                                        top-3

                                                        flex
                                                        h-9
                                                        w-9
                                                        items-center
                                                        justify-center

                                                        rounded-xl

                                                        bg-black/60

                                                        text-white

                                                        backdrop-blur

                                                        hover:bg-black/75
                                                    "
                                                    aria-label="Remove image"
                                                >
                                                    <X size={16} />
                                                </button>

                                            </>

                                        ) : (

                                            <label
                                                className="
                                                    flex
                                                    aspect-[16/7]
                                                    cursor-pointer
                                                    flex-col
                                                    items-center
                                                    justify-center
                                                    p-6
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        h-12
                                                        w-12
                                                        items-center
                                                        justify-center
                                                        rounded-2xl
                                                        bg-[var(--nova-lavender-soft)]
                                                        text-[var(--nova-primary)]
                                                    "
                                                >
                                                    <Upload
                                                        size={21}
                                                    />
                                                </div>

                                                <p
                                                    className="
                                                        mt-3
                                                        text-sm
                                                        font-semibold
                                                        text-[var(--nova-text)]
                                                    "
                                                >
                                                    Upload hero image
                                                </p>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-xs
                                                        text-[var(--nova-muted)]
                                                    "
                                                >
                                                    JPG, PNG or WebP • Max 2MB
                                                </p>

                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={
                                                        handleImageChange
                                                    }
                                                    className="hidden"
                                                />

                                            </label>

                                        )}

                                    </div>

                                </div>


                                {/* =================================
                                    CONTENT
                                ================================= */}

                                <div
                                    className="
                                        space-y-4
                                    "
                                >

                                    {/* TITLE */}

                                    <div>

                                        <label
                                            className="
                                                mb-2
                                                block
                                                text-xs
                                                font-semibold
                                                text-[var(--nova-text)]
                                            "
                                        >
                                            Title
                                        </label>

                                        <input
                                            value={title}
                                            onChange={
                                                e =>
                                                    setTitle(
                                                        e.target.value
                                                    )
                                            }
                                            placeholder="Summer Sale"
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-[var(--nova-border)]
                                                bg-[var(--nova-surface)]
                                                px-4
                                                py-3
                                                text-sm
                                                text-[var(--nova-text)]
                                                outline-none

                                                focus:border-[var(--nova-primary)]
                                            "
                                        />

                                    </div>


                                    {/* SUBTITLE */}

                                    <div>

                                        <label
                                            className="
                                                mb-2
                                                block
                                                text-xs
                                                font-semibold
                                                text-[var(--nova-text)]
                                            "
                                        >
                                            Subtitle
                                        </label>

                                        <textarea
                                            value={subtitle}
                                            onChange={
                                                e =>
                                                    setSubtitle(
                                                        e.target.value
                                                    )
                                            }
                                            placeholder="Up to 50% off on selected products"
                                            rows={3}
                                            className="
                                                w-full
                                                resize-none
                                                rounded-xl
                                                border
                                                border-[var(--nova-border)]
                                                bg-[var(--nova-surface)]
                                                px-4
                                                py-3
                                                text-sm
                                                text-[var(--nova-text)]
                                                outline-none

                                                focus:border-[var(--nova-primary)]
                                            "
                                        />

                                    </div>


                                    {/* BUTTON ROW */}

                                    <div
                                        className="
                                            grid
                                            gap-4

                                            sm:grid-cols-2
                                        "
                                    >

                                        <div>

                                            <label
                                                className="
                                                    mb-2
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-[var(--nova-text)]
                                                "
                                            >
                                                Button Text
                                            </label>

                                            <input
                                                value={buttonText}
                                                onChange={
                                                    e =>
                                                        setButtonText(
                                                            e.target.value
                                                        )
                                                }
                                                placeholder="Shop Now"
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-[var(--nova-border)]
                                                    bg-[var(--nova-surface)]
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    text-[var(--nova-text)]
                                                    outline-none

                                                    focus:border-[var(--nova-primary)]
                                                "
                                            />

                                        </div>


                                        <div>

                                            <label
                                                className="
                                                    mb-2
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-[var(--nova-text)]
                                                "
                                            >
                                                Button Link
                                            </label>

                                            <input
                                                value={buttonLink}
                                                onChange={
                                                    e =>
                                                        setButtonLink(
                                                            e.target.value
                                                        )
                                                }
                                                placeholder="/products"
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-[var(--nova-border)]
                                                    bg-[var(--nova-surface)]
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    text-[var(--nova-text)]
                                                    outline-none

                                                    focus:border-[var(--nova-primary)]
                                                "
                                            />

                                        </div>

                                    </div>


                                    {/* ORDER + ACTIVE */}

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-4

                                            sm:flex-row
                                            sm:items-end
                                        "
                                    >

                                        <div
                                            className="
                                                sm:w-32
                                            "
                                        >

                                            <label
                                                className="
                                                    mb-2
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-[var(--nova-text)]
                                                "
                                            >
                                                Display Order
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={order}
                                                onChange={
                                                    e =>
                                                        setOrder(
                                                            e.target.value
                                                        )
                                                }
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-[var(--nova-border)]
                                                    bg-[var(--nova-surface)]
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    text-[var(--nova-text)]
                                                    outline-none

                                                    focus:border-[var(--nova-primary)]
                                                "
                                            />

                                        </div>


                                        <label
                                            className="
                                                flex
                                                min-h-11
                                                cursor-pointer
                                                items-center
                                                gap-3
                                                rounded-xl
                                                border
                                                border-[var(--nova-border)]
                                                px-4
                                                py-3
                                            "
                                        >

                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={
                                                    e =>
                                                        setIsActive(
                                                            e.target.checked
                                                        )
                                                }
                                                className="
                                                    h-4
                                                    w-4
                                                    accent-[var(--nova-primary)]
                                                "
                                            />

                                            <span
                                                className="
                                                    text-sm
                                                    font-medium
                                                    text-[var(--nova-text)]
                                                "
                                            >
                                                Active banner
                                            </span>

                                        </label>

                                    </div>

                                </div>

                            </div>


                            {/* FORM ACTIONS */}

                            <div
                                className="
                                    flex
                                    flex-col-reverse
                                    gap-3
                                    border-t
                                    border-[var(--nova-border)]
                                    bg-[var(--nova-surface-soft)]
                                    px-5
                                    py-4

                                    sm:flex-row
                                    sm:justify-end
                                    sm:px-6
                                "
                            >

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        resetForm()
                                        setShowForm(false)
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={saving}
                                >
                                    {editingId
                                        ? <Save size={16} />
                                        : <Plus size={16} />}

                                    {saving
                                        ? 'Saving...'
                                        : editingId
                                            ? 'Save Changes'
                                            : 'Create Banner'}
                                </Button>

                            </div>

                        </form>

                    )}


                    {/* ====================================
                        HERO LIST
                    ==================================== */}

                    {heroes.length === 0 ? (

                        <div
                            className="
                                rounded-3xl
                                border
                                border-[var(--nova-border)]
                                bg-[var(--nova-surface)]
                                p-8
                            "
                        >

                            <EmptyState
                                title="No hero banners"
                                description="Create your first hero banner to display it on the NovaCart homepage."
                            />

                        </div>

                    ) : (

                        <div
                            className="
                                space-y-4
                            "
                        >

                            {heroes.map(
                                (hero) => (

                                    <div
                                        key={hero._id}
                                        className="
                                            overflow-hidden
                                            rounded-3xl
                                            border
                                            border-[var(--nova-border)]
                                            bg-[var(--nova-surface)]
                                            shadow-[var(--shadow-sm)]
                                        "
                                    >

                                        <div
                                            className="
                                                grid

                                                lg:grid-cols-[280px_1fr_auto]
                                            "
                                        >

                                            {/* IMAGE */}

                                            <div
                                                className="
                                                    relative
                                                    overflow-hidden
                                                    bg-[var(--nova-surface-soft)]
                                                "
                                            >

                                                {hero.image ? (

                                                    <img
                                                        src={hero.image}
                                                        alt={
                                                            hero.title ||
                                                            'Hero banner'
                                                        }
                                                        className="
                                                            aspect-[16/7]
                                                            h-full
                                                            w-full
                                                            object-cover

                                                            lg:aspect-auto
                                                            lg:min-h-[170px]
                                                        "
                                                    />

                                                ) : (

                                                    <div
                                                        className="
                                                            flex
                                                            min-h-[170px]
                                                            items-center
                                                            justify-center
                                                            text-[var(--nova-muted)]
                                                        "
                                                    >
                                                        <ImageIcon
                                                            size={28}
                                                        />
                                                    </div>

                                                )}

                                                <div
                                                    className="
                                                        absolute
                                                        left-3
                                                        top-3
                                                        flex
                                                        items-center
                                                        gap-1.5
                                                        rounded-full
                                                        bg-black/60
                                                        px-2.5
                                                        py-1
                                                        text-[10px]
                                                        font-semibold
                                                        text-white
                                                        backdrop-blur
                                                    "
                                                >

                                                    <GripVertical
                                                        size={12}
                                                    />

                                                    Order {hero.order}

                                                </div>

                                            </div>


                                            {/* CONTENT */}

                                            <div
                                                className="
                                                    min-w-0
                                                    p-5
                                                "
                                            >

                                                <div
                                                    className="
                                                        mb-3
                                                        flex
                                                        items-center
                                                        gap-2
                                                    "
                                                >

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-full
                                                            px-2.5
                                                            py-1
                                                            text-[10px]
                                                            font-semibold

                                                            ${
                                                                hero.isActive
                                                                    ? 'bg-[rgba(34,197,94,0.1)] text-green-600'
                                                                    : 'bg-[var(--nova-surface-soft)] text-[var(--nova-muted)]'
                                                            }
                                                        `}
                                                    >

                                                        {hero.isActive
                                                            ? <Eye size={12} />
                                                            : <EyeOff size={12} />}

                                                        {hero.isActive
                                                            ? 'Active'
                                                            : 'Inactive'}

                                                    </span>

                                                </div>


                                                <h2
                                                    className="
                                                        truncate
                                                        text-base
                                                        font-bold
                                                        text-[var(--nova-text)]
                                                    "
                                                >
                                                    {hero.title ||
                                                        'Untitled banner'}
                                                </h2>


                                                {hero.subtitle && (

                                                    <p
                                                        className="
                                                            mt-1
                                                            line-clamp-2
                                                            text-sm
                                                            leading-6
                                                            text-[var(--nova-muted)]
                                                        "
                                                    >
                                                        {hero.subtitle}
                                                    </p>

                                                )}


                                                <div
                                                    className="
                                                        mt-4
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-2
                                                    "
                                                >

                                                    {hero.buttonText && (

                                                        <span
                                                            className="
                                                                rounded-lg
                                                                bg-[var(--nova-lavender-soft)]
                                                                px-2.5
                                                                py-1.5
                                                                text-xs
                                                                font-semibold
                                                                text-[var(--nova-primary)]
                                                            "
                                                        >
                                                            {hero.buttonText}
                                                        </span>

                                                    )}

                                                    {hero.buttonLink && (

                                                        <span
                                                            className="
                                                                max-w-[240px]
                                                                truncate
                                                                text-xs
                                                                text-[var(--nova-muted)]
                                                            "
                                                        >
                                                            {hero.buttonLink}
                                                        </span>

                                                    )}

                                                </div>

                                            </div>


                                            {/* ACTIONS */}

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    border-t
                                                    border-[var(--nova-border)]
                                                    p-4

                                                    lg:flex-col
                                                    lg:border-l
                                                    lg:border-t-0
                                                    lg:justify-center
                                                "
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleActive(
                                                            hero
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        h-10
                                                        flex-1
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        border-[var(--nova-border)]
                                                        px-3
                                                        text-xs
                                                        font-semibold
                                                        text-[var(--nova-text)]

                                                        hover:bg-[var(--nova-surface-soft)]

                                                        lg:w-28
                                                        lg:flex-none
                                                    "
                                                >

                                                    {hero.isActive
                                                        ? <EyeOff size={15} />
                                                        : <Eye size={15} />}

                                                    {hero.isActive
                                                        ? 'Disable'
                                                        : 'Activate'}

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        editHero(
                                                            hero
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        h-10
                                                        w-10
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        border
                                                        border-[var(--nova-border)]
                                                        text-[var(--nova-muted)]

                                                        hover:bg-[var(--nova-surface-soft)]
                                                        hover:text-[var(--nova-primary)]
                                                    "
                                                    aria-label="Edit hero"
                                                >
                                                    <Edit
                                                        size={16}
                                                    />
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            hero
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        h-10
                                                        w-10
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        border
                                                        border-[var(--nova-border)]
                                                        text-[var(--nova-muted)]

                                                        hover:bg-[rgba(239,68,68,0.08)]
                                                        hover:text-[var(--nova-danger)]
                                                    "
                                                    aria-label="Delete hero"
                                                >
                                                    <Trash2
                                                        size={16}
                                                    />
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </Container>

            </main>
        </>
    )
}

export default Heroes