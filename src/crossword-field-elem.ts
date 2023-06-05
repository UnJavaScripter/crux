export enum EmptyFieldValue {
  Separator = "⬜",
  Spacer = "⬛",
  TextInput = ""

}

enum FieldType {
  Separator = "separator",
  TextInput = "text-input",
  Spacer = "spacer"
}
class DcCrosswordField extends HTMLElement {
  _fieldType: FieldType | undefined
  _value: string | undefined
  styleTag: HTMLStyleElement
  separatorLabelX: string | undefined
  separatorLabelY: string | undefined
  inputElem: HTMLInputElement | undefined
  _isDevMode: boolean | undefined


  constructor() {
    super()
    
    this.fieldType =  undefined
    this.attachShadow({ mode: "open", delegatesFocus: true })
    this.styleTag = <HTMLStyleElement>document.createElement("style");
    this.styleTag.textContent = this._style()
  }

  get value(): string | undefined {
    return this._value
  }
  
  set value(val: string | undefined) {
    if (val === undefined) {
      this.removeAttribute("value")
    } else {
      if (this._value === val) {
        return
      } else {
        this.setAttribute("value", val)
        this._value = val
      }
    }
  }

  get isDevMode(): boolean | undefined {
    return this._isDevMode
  }
  
  set isDevMode(val: boolean | undefined) {
    if (val === undefined) {
      this.removeAttribute("isDevMode")
    } else {
      if (this._isDevMode === val) {
        return
      } else {
        this.setAttribute("isDevMode", String(val))
        this._isDevMode = val
      }
    }
  }

  get fieldType(): string | undefined {
    return this._fieldType
  }
  
  set fieldType(val: FieldType | undefined) {
    if (val === undefined) {
      this.removeAttribute("fieldType")
    } else {
      if (this._fieldType === val) {
        return
      } else {
        this.setAttribute("fieldType", val)
        this._fieldType = val
      }
    }
  }

  static get observedAttributes() { return ['value', 'field-type', 'separator-labels', 'is-dev-mode']; }

  connectedCallback(): void {
    this.isDevMode = this.getAttribute("is-dev-mode") !== null
    this.fieldType = (this.getAttribute("field-type") as FieldType) ||  FieldType.TextInput
    if (this.fieldType === FieldType.TextInput) {
      this._initTextInput()
    }
    this.updateStyles()
    this.shadowRoot?.append(this.styleTag)
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (newVal !== oldVal) {
      this._updateRendering(name, oldVal, newVal);
    }
  }

  _updateRendering(attrName: string, oldVal: string, newVal: string) {
    switch(attrName) {
      case('value'): {
        this.value = newVal;
        break;
      }
      case('field-type'): {
        this.setAttribute("field-type", newVal)
        this.fieldType = <FieldType>newVal
        break;
      }
      case('separator-labels'): {
        this.setAttribute("separator-labels", newVal)
        const separatorLabels = newVal.split(",")
        this.separatorLabelX = separatorLabels[0]
        this.separatorLabelY = separatorLabels[1]
        break;
      }
      case('is-dev-mode'): {
        this.setAttribute("is-dev-mode", newVal)
        this.isDevMode = Boolean(newVal)
        break;
      }
    }
    this.updateStyles()
  }

  private updateStyles() {
    this.styleTag.textContent = this._style()

    if (this.fieldType === FieldType.Separator) {
      this.styleTag.textContent += this._getSeparatorStyles()
    } else if (this.fieldType === FieldType.TextInput) {
      this.styleTag.textContent += this._getTextInputStyles()
    } else if (this.fieldType === FieldType.Spacer) {
      this.styleTag.textContent += this._getSpacerStyles()
    }
  }

  private _style() {
    return `
      :host {
        width: 100%;
        height: 100%;
        display: block;
        position: relative;
        border: 1px solid black;
      }
      input {
        width: 100%;
      }
    `
  }

  private _getSeparatorStyles() {
    return `
      :host {
        background-color: #c3c3c3;
      }
      :host::after {
        ${!this.isDevMode && this.separatorLabelX ? `content: "${this.separatorLabelX}";` : ""}
        height: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        color: #222;
        font-size: 0.6rem;
      }
      :host::before {
        ${!this.isDevMode && this.separatorLabelY ? `content: "${this.separatorLabelY}";` : ""}
        height: 100%;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: end;
        position: absolute;
        color: #222;
        font-size: 0.6rem;
      }
    `
  }

  private _getTextInputStyles() {
    return `
    input {
      width: 100%;
      height: 100%;
      padding: 0;
      border: none;
      background-color: #f9f9f9;
      color: #444;
      text-transform: uppercase;
      text-align: center;
    }
    `
  }

  private _getSpacerStyles() {
    return `
    input {
      width: 100%;
      height: 100%;
      padding: 0;
      border: none;
      background-color: pink;
      color: gold;
      text-transform: uppercase;
      text-align: center;
    }
    `
  }

  toggleFieldType() {
    if (this.fieldType === FieldType.TextInput) {
      this.fieldType = FieldType.Separator
      this.setAttribute("field-type", FieldType.Separator)
      this.value = EmptyFieldValue.Separator
      ;(this.inputElem as HTMLInputElement).value = this.value || ""
      for (const node of (this.shadowRoot?.childNodes as any)) {
        if (node.tagName === "INPUT") {
          this.shadowRoot?.removeChild(node)
        }
      }
    }  else if (this.fieldType === FieldType.Separator) {
      this.fieldType = FieldType.Spacer
      this.setAttribute("field-type", FieldType.Spacer)
      this.value = EmptyFieldValue.Spacer
    } else if (this.fieldType === FieldType.Spacer) {
      this.fieldType = FieldType.TextInput
      this.setAttribute("field-type", FieldType.TextInput)
      this.value = ""
      this._initTextInput()
    }

    this.updateStyles()
  }

  private keyDownListener(event: KeyboardEvent) {
    if (
      event.isComposing ||
      event.altKey ||
      event.key === "Tab" ||
      event.key === "Shift"
    ) {
      return
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      if (event.ctrlKey) {
        this.setAttribute("field-type", FieldType.Separator)
      } else {
        this.value = (<any>undefined)
        ;(this.inputElem as HTMLInputElement).value = ""
      }
    }
    if (event.key.match("^[A-Za-z0-9]$") && (this.inputElem?.value as any).length >= 0) {
      ;(this.inputElem as HTMLInputElement).value = ""
      this.value = event.key
    } else {
      event.preventDefault()
    }
  }

  private _initTextInput() {
    
    this.inputElem = <HTMLInputElement>document.createElement("input")
    this.inputElem.value = this.value || ""

    this.inputElem.addEventListener("keydown", this.keyDownListener.bind(this))

    this.shadowRoot?.appendChild(this.inputElem)
  }

}

window.customElements.define('dc-crossword-field', DcCrosswordField);