# Security Model & Policy

This document details the security model, threat mitigations, and vulnerability reporting procedures for the Verdura protocol.

## 1. Clarity Security Model

Verdura's smart contracts are written in **Clarity**, a decidable, non-Turing-complete language for Stacks smart contracts. This design choice inherently eliminates several common smart contract vulnerabilities:

- **Reentrancy Immunity**: Clarity does not support dynamic dispatch, user-defined callbacks, or re-entrant calls. Contract execution flows are static and predictable, preventing reentrancy attacks.
- **Safe Arithmetic**: Clarity has built-in protection against integer overflows and underflows. Any operation that would exceed numerical bounds aborts the transaction immediately.
- **No Compiler Reordering**: Clarity is interpreted directly on-chain, eliminating compiler optimization bugs or reordering exploits.
- **Static Analysis**: Clarity's design allows for precise static analysis of contract behavior, data access, and execution cost before deployment.

---

## 2. Threat Matrix & Mitigations

| Threat Vector | Mitigation Strategy | Implementation Details |
|---|---|---|
| **`tx-sender` Spoofing / Phishing** | Check `contract-caller` for authentication | Admin functions in `yield-router.clar` verify that `contract-caller` matches the stored owner: `(asserts! (is-eq contract-caller (var-get contract-owner)) err-unauthorized)` |
| **Unauthorized Proxy Calls** | Bind user interactions to direct execution | In `savings-vault.clar`, key mutations require `contract-caller` to match `tx-sender`: `(asserts! (is-eq contract-caller tx-sender) err-unauthorized)` |
| **Zero-Share / Rounding Exploits** | Strict division guards | In `yield-router.clar`, the `route-to-yield` function requires `(asserts! (> shares-minted u0) err-zero-amount)` to reject dust deposits that would yield 0 shares due to division truncation. |
| **Caller Spoofing on Profiles** | Static binding | In `savings-profile.clar`, record updates are restricted to the `.savings-vault` address: `(asserts! (is-eq contract-caller .savings-vault) err-unauthorized)` |
| **Cross-Site Scripting (XSS)** | Dynamic CSP with unique nonces | Frontend routes generate a unique cryptographically secure base64 nonce per request using Web Crypto in `middleware.ts`. |
| **Clickjacking / Framing** | Content-Security-Policy and X-Frame-Options | Standard HTTP security headers (`X-Frame-Options: DENY`, `frame-ancestors 'none'`) prevent the application from being loaded inside an iframe. |

---

## 3. Protocol Limitations & Invariants

### Invariants
The system enforces state invariants across contracts:
- `total-vault-shares` tracked in `savings-vault.clar` must exactly match the `total-shares-issued` tracked in `yield-router.clar`. This invariant can be inspected via the read-only function `(check-invariants)` on `savings-vault.clar`.

### Known Limits
- **Vault Upper Bound**: Due to loop constraints on-chain, each principal is limited to a maximum of 50 active vaults. Any attempt to create a vault beyond this limit will fail with `err-vault-limit-reached`.

---

## 4. Reporting a Vulnerability

If you discover a security vulnerability within Verdura, please do not disclose it publicly. Contact the security team immediately:

- **Email**: security@verdura.fi

Please provide a detailed description of the vulnerability, steps to reproduce, and a working proof of concept (PoC) if possible. We aim to respond within 24 hours and coordinate a patch within 7 days.
