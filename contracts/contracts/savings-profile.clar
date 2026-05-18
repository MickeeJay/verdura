;; savings-profile.clar

;; Error Constants
(define-constant err-unauthorized (err u300))
(define-constant err-profile-not-found (err u301))
(define-constant err-already-exists (err u302))

;; Data Maps
(define-map profiles
  principal
  {
    total-vaults-completed: uint,
    total-saved: uint,
    total-yield-earned: uint,
    member-since: uint,
    last-vault-block: uint
  }
)

;; Public Functions
(define-public (record-deposit (owner principal) (vault-id uint) (amount uint))
  (begin
    (asserts! (is-eq contract-caller .savings-vault) err-unauthorized)
    (ok true)
  )
)

(define-public (record-withdrawal (user principal) (amount uint))
  (ok true)
)

(define-read-only (get-profile (owner principal))
  (map-get? profiles owner)
)

(define-read-only (get-total-saved (user principal))
  (ok u0)
)

(define-read-only (is-member (owner principal))
  (is-some (map-get? profiles owner))
)

(define-read-only (get-leaderboard-score (owner principal))
  (match (map-get? profiles owner)
    profile
    (+ (* (get total-vaults-completed profile) u100) (/ (get total-saved profile) u1000))
    u0
  )
)

(define-read-only (get-savings-streak (owner principal))
  (match (map-get? profiles owner)
    profile
    (let
      (
        (last-block (get last-vault-block profile))
      )
      (if (is-eq last-block u0)
        u0
        (if (<= (- block-height last-block) u4320)
          (get total-vaults-completed profile)
          u0
        )
      )
    )
    u0
  )
)

