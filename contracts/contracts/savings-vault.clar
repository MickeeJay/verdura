;; savings-vault.clar

;; Error Constants
(define-constant err-unauthorized (err u100))
(define-constant err-already-exists (err u101))
(define-constant err-not-found (err u102))
(define-constant err-vault-locked (err u103))
(define-constant err-vault-matured (err u104))
(define-constant err-insufficient-balance (err u105))
(define-constant err-invalid-amount (err u106))
(define-constant err-invalid-duration (err u107))
