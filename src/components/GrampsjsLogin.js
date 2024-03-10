/* eslint-disable lit-a11y/click-events-have-key-events */
import {html, css, LitElement} from 'lit'

import '@material/mwc-icon'
import '@material/mwc-button'
import '@material/mwc-textfield'
import '@material/mwc-circular-progress'

import './GrampsjsPasswordManagerPolyfill.js'
import {sharedStyles} from '../SharedStyles.js'
import {apiGetTokens, apiResetPassword, apiRegisterUser} from '../api.js'
import {fireEvent} from '../util.js'
import {GrampsjsTranslateMixin} from '../mixins/GrampsjsTranslateMixin.js'

const BASE_DIR = ''

class GrampsjsLogin extends GrampsjsTranslateMixin(LitElement) {
  static get styles() {
    return [
      sharedStyles,
      css`
        #login-container {
          margin: auto;
          height: 100%;
          max-width: 20em;
        }

        #login-form {
          position: relative;
          top: 25vh;
        }

        #login-form mwc-textfield {
          width: 100%;
          margin-bottom: 0.7em;
        }

        #login-form mwc-button {
        }

        p.reset-link {
          padding-top: 1em;
          font-size: 0.9em;
        }

        p.success {
          padding-top: 1em;
          color: #4caf50;
          font-size: 1.2em;
          font-weight: 400;
          --mdc-icon-size: 1.6em;
          line-height: 1.4em;
          text-align: center;
        }

        mwc-circular-progress {
          --mdc-theme-primary: white;
        }
      `,
    ]
  }

  static get properties() {
    return {
      resetpw: {type: Boolean},
      register: {type: Boolean},
      isFormValid: {type: Boolean},
      credentials: {type: Object},
      tree: {type: String},
    }
  }

  constructor() {
    super()
    this.resetpw = false
    this.register = false
    this.isFormValid = false
    this.credentials = {}
    this.tree = ''
  }

  render() {
    if (this.resetpw) {
      return this._renderResetPw()
    }
    if (this.register) {
      return this._renderRegister()
    }
    return this._renderLogin()
  }

  _renderLogin() {
    return html`
      <div id="login-container">
        <form
          id="login-form"
          action="${BASE_DIR}/"
          @keydown="${this._handleLoginKey}"
        >
          <mwc-textfield
            outlined
            autocapitalize="off"
            id="username"
            label="${this._('Username')}"
            @input="${this._credChanged}"
            @change="${this._credChanged}"
            value="${this.credentials.username || ''}"
          ></mwc-textfield>
          <mwc-textfield
            outlined
            autocapitalize="off"
            id="password"
            label="${this._('Password')}"
            type="password"
            @input="${this._credChanged}"
            @change="${this._credChanged}"
            value="${this.credentials.password || ''}"
          ></mwc-textfield>
          <mwc-button
            raised
            label="${this._('login')}"
            type="submit"
            @click="${this._submitLogin}"
          >
            <span slot="trailingIcon" style="display:none;">
              <mwc-circular-progress
                indeterminate
                density="-7"
                closed
                id="login-progress"
              >
              </mwc-circular-progress>
            </span>
          </mwc-button>
          <p class="reset-link">
            <span
              class="link"
              @click="${() => {
                this.resetpw = true
              }}"
              >${this._('Lost password?')}</span
            >
          </p>
          ${window.grampsjsConfig.hideRegisterLink
            ? ''
            : html`
                <p class="reset-link">
                  <span
                    class="link"
                    @click="${() => {
                      this.register = true
                    }}"
                    >${this._('Register new account')}</span
                  >
                </p>
              `}
        </form>
        <grampsjs-password-manager-polyfill
          .credentials=${this.credentials}
          @form-submitted=${this._submitLogin}
          @value-changed=${this._loginFormChanged}
        ></grampsjs-password-manager-polyfill>
      </div>
    `
  }

  firstUpdated() {
    const pf = this.shadowRoot.querySelector(
      'grampsjs-password-manager-polyfill'
    )
    if (pf !== null) {
      pf.boundingRect = this.getBoundingClientRect()
    }
  }

  _credChanged(e) {
    this.credentials = {...this.credentials, [e.target.id]: e.target.value}
  }

  _renderResetPw() {
    return html`
      <div id="login-container">
        <form id="login-form" action="${BASE_DIR}/">
          <div id="inner-form">
            <mwc-textfield
              outlined
              autocapitalize="off"
              id="username"
              label="${this._('Username')}"
              type="text"
            ></mwc-textfield>
            <mwc-button
              raised
              label="${this._('reset password')}"
              type="submit"
              @click="${this._resetPw}"
            >
              <span slot="trailingIcon" style="display:none;">
                <mwc-circular-progress
                  indeterminate
                  density="-7"
                  closed
                  id="login-progress"
                >
                </mwc-circular-progress>
              </span>
            </mwc-button>
          </div>
          <p class="success" id="reset-success" style="display:none;">
            <mwc-icon>check_circle</mwc-icon><br />
            ${this._('A password reset link has been sent by e-mail.')}
          </p>
          <p class="reset-link">
            <span
              class="link"
              @click="${() => {
                this.resetpw = false
              }}"
              >${this._('_Back')}</span
            >
          </p>
        </form>
      </div>
    `
  }

  _renderRegister() {
    return html`
      <div id="login-container">
        <form
          id="login-form"
          action="${BASE_DIR}/"
          @keydown="${this._checkFormValid}"
        >
          <div id="inner-form">
            <mwc-textfield
              required
              outlined
              autocapitalize="off"
              id="username"
              label="${this._('Username')}"
              type="text"
            ></mwc-textfield>
            <mwc-textfield
              required
              outlined
              autocapitalize="off"
              id="password"
              label="${this._('Password')}"
              type="password"
            ></mwc-textfield>
            <mwc-textfield
              required
              outlined
              autocapitalize="off"
              id="email"
              label="${this._('E-mail')}"
              type="email"
            ></mwc-textfield>
            <mwc-textfield
              required
              outlined
              id="fullname"
              label="${this._('Full Name')}"
              type="text"
            ></mwc-textfield>
            <mwc-button
              raised
              label="${this._('Submit')}"
              type="submit"
              @click="${this._register}"
              ?disabled="${!this.isFormValid}"
            >
              <span slot="trailingIcon" style="display:none;">
                <mwc-circular-progress
                  indeterminate
                  density="-7"
                  closed
                  id="login-progress"
                >
                </mwc-circular-progress>
              </span>
            </mwc-button>
          </div>
          <p class="success" id="register-success" style="display:none;">
            <mwc-icon>check_circle</mwc-icon><br />
            ${this._('New account registered successfully.')}
            <br />
            ${this._(
              'Please confirm your e-mail address by clicking the link in the e-mail you received and then wait for the tree owner to activate your account.'
            )}
          </p>
          <p class="reset-link">
            ${this._('Already have an account?')}
            <span
              class="link"
              @click="${() => {
                this.register = false
              }}"
              >${this._('login')}</span
            >
          </p>
        </form>
      </div>
    `
  }

  _checkFormValid() {
    const fields = Array.from(this.shadowRoot.querySelectorAll('mwc-textfield'))
    this.isFormValid = fields.every(el => el?.validity?.valid)
  }

  _handleLoginKey(event) {
    if (event.code === 'Enter') {
      this._submitLogin()
    }
  }

  async _submitLogin() {
    const submitProgress = this.shadowRoot.getElementById('login-progress')
    submitProgress.parentElement.style.display = 'block'
    submitProgress.closed = false
    apiGetTokens(this.credentials.username, this.credentials.password).then(
      res => {
        if ('error' in res) {
          submitProgress.parentElement.style.display = 'none'
          submitProgress.closed = true
          this._showError(res.error)
        } else {
          document.location.href = '/'
        }
      }
    )
  }

  _loginFormChanged(ev) {
    this.credentials = {...this.credentials, ...ev.detail.value}
  }

  async _resetPw() {
    const userField = this.shadowRoot.getElementById('username')
    if (userField.value === '') {
      this._showError('Username must not be empty.')
      return
    }
    const res = await apiResetPassword(userField.value)
    const innerForm = this.shadowRoot.getElementById('inner-form')
    const divSuccess = this.shadowRoot.getElementById('reset-success')
    if ('error' in res) {
      this._showError(res.error)
    } else {
      divSuccess.style.display = 'block'
      innerForm.style.display = 'none'
    }
  }

  async _register() {
    const userField = this.shadowRoot.getElementById('username')
    const pwField = this.shadowRoot.getElementById('password')
    const emailField = this.shadowRoot.getElementById('email')
    const nameField = this.shadowRoot.getElementById('fullname')
    const tree = this.tree || ''
    const res = await apiRegisterUser(
      userField.value,
      pwField.value,
      emailField.value,
      nameField.value,
      tree
    )
    const innerForm = this.shadowRoot.getElementById('inner-form')
    const divSuccess = this.shadowRoot.getElementById('register-success')
    if ('error' in res) {
      this._showError(res.error)
    } else {
      divSuccess.style.display = 'block'
      innerForm.style.display = 'none'
    }
  }

  _showError(message) {
    fireEvent(this, 'grampsjs:error', {message})
  }
}

window.customElements.define('grampsjs-login', GrampsjsLogin)
