import * as React from "react"

import { ToastActionElement, ToastProps } from "~/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST
      toast: ToasterToast
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST
      toast: Partial<ToasterToast>
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST
      toastId?: ToasterToast["id"]
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action
      // ! This is basically a hack. OPTIMIZE:
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        }
      } else {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({ ...t, open: false })),
        }
      }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

function useToast() {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] })

  const addToast = React.useCallback((toast: ToasterToast) => {
    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...toast,
        id: genId(),
        open: true,
        onOpenChange: (open) => {
          if (!open) {
            dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toast.id })
          }
        },
      },
    })
  }, [dispatch])

  const updateToast = React.useCallback((toast: Partial<ToasterToast>) => {
    dispatch({ type: actionTypes.UPDATE_TOAST, toast })
  }, [dispatch])

  const dismissToast = React.useCallback((toastId?: ToasterToast["id"]) => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
  }, [dispatch])

  const removeToast = React.useCallback((toastId?: ToasterToast["id"]) => {
    dispatch({ type: actionTypes.REMOVE_TOAST, toastId })
  }, [dispatch])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (state.toasts.length > 0) {
        dispatch({ type: actionTypes.REMOVE_TOAST, toastId: state.toasts[0].id })
      }
    }, TOAST_REMOVE_DELAY)

    return () => {
      clearTimeout(timer)
    }
  }, [state.toasts])

  return {
    toasts: state.toasts,
    addToast,
    updateToast,
    dismissToast,
    removeToast,
  }
}

export { useToast, reducer, actionTypes }
