type AlertCode = number | string
type AlertName = string | undefined
type AlertMessage = string | undefined

export interface Alert {
    code?: AlertCode
    name: AlertName
    message: AlertMessage
}