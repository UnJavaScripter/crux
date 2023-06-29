import { EmptyFieldValue } from "./crossword-field-elem"

export class Crossword {
  crosswordLength: number
  finalRowsNumber: number
  finalColumnsNumber: number
  fieldsArr: string[]
  
  constructor(
    private parentElem: HTMLElement,
    // @ts-ignore
    private rows: number,
    private columns: number,
    // @ts-ignore
    private fields: string[],
    private isDevMode: boolean = false
  ) {
    this.fieldsArr = this.processFieldsArr(fields, rows)
    this.crosswordLength = this.fieldsArr.length
    this.finalRowsNumber = rows + 1
    this.finalColumnsNumber = columns + 1
    if (this.finalRowsNumber * this.finalColumnsNumber !== this.crosswordLength) {
      throw ("The fields array length should be equal to Rows times Columns")
    }
    this.parentElem.appendChild(this.createCrossword(this.fieldsArr))
  }

  processFieldsArr(fieldsArr: (string|undefined)[], rows: number) {
    let newArr = []
    for (let i = 0; i < fieldsArr.length ; i++) {
      if ( i % rows === 0) {
        newArr.push(EmptyFieldValue.Spacer)
      }
        newArr.push(fieldsArr[i])
    }
    const fieldsArrWithSpacerRows = [...new Array(rows +1).fill(EmptyFieldValue.Spacer), ...newArr]
    return fieldsArrWithSpacerRows
  }

  capture(crosswordElem: HTMLElement) {
    const fields = (crosswordElem.getElementsByTagName("form")[0].childNodes)
    const crosswordArr: string[] = []

    let val
    for (let i = this.columns - 1; i < fields.length; i++) {
      if ( i % this.finalRowsNumber !== 0) {
        val = (fields[i] as HTMLInputElement).value
        if (val) {
          crosswordArr.push(val)
        } else {
          crosswordArr.push("")
        }
      }
    }
    console.log(crosswordArr)
  }

  fillOutCrossword(crosswordElem: HTMLElement, fieldsArr: string[]) {
    let fieldValue
    let nextFieldElemXIndex = 0
    let nextFieldElemYIndex = 0
    let fieldElem: HTMLInputElement
    let newFieldValue: EmptyFieldValue

    for (let i = 0; i < fieldsArr.length; i++) {
      fieldValue = this.fieldsArr[i]
      
      if (
        fieldValue === EmptyFieldValue.Spacer || 
        fieldValue === EmptyFieldValue.Separator 
        ) {
          let valX
          if (this.fieldsArr[i + 1] !== EmptyFieldValue.Separator && this.fieldsArr[i + 1] !== EmptyFieldValue.Spacer) {
            // The field to the right is not a Separator or Spacer
            valX = (nextFieldElemXIndex + 1).toString()
            nextFieldElemXIndex++
            newFieldValue = EmptyFieldValue.Separator
          } else {
            valX = ""
            newFieldValue = EmptyFieldValue.Spacer
          }

          let valY
          if (
            i < this.fieldsArr.length - this.finalRowsNumber && 
            (this.fieldsArr[i + (this.finalRowsNumber)] !== EmptyFieldValue.Separator && this.fieldsArr[i + (this.finalRowsNumber)] !== EmptyFieldValue.Spacer)
          ) {
            // The below is not a Separator or Spacer
            valY = (nextFieldElemYIndex + 1).toString()
            nextFieldElemYIndex++
            newFieldValue = EmptyFieldValue.Separator

          } else {
            valY = ""
            if (newFieldValue === EmptyFieldValue.Separator) {

              newFieldValue = EmptyFieldValue.Separator
            } else {

              newFieldValue = EmptyFieldValue.Spacer
            }
          }


          fieldElem = this.createField(i, newFieldValue, valX, valY)
        } else {
          fieldElem = this.createField(i, fieldValue)
        }
        crosswordElem.appendChild(fieldElem)

    }
  }


  private createField(index: number, value: string | undefined, separatorLabelX?: string | null, separatorLabelY?: string | null): HTMLInputElement {
    const fieldElem: HTMLInputElement = <HTMLInputElement>document.createElement("dc-crossword-field")
    fieldElem.classList.add("field")
    fieldElem.setAttribute("tabindex", "0")
    fieldElem.setAttribute("field-id", index.toString())
    if (this.isDevMode) {
      fieldElem.setAttribute("is-dev-mode", "true")
      if (value !== undefined) {
        switch(value) {
          case(EmptyFieldValue.Separator): {
            fieldElem.setAttribute("field-type", "separator")
            break
          }
          case(EmptyFieldValue.Spacer): {
            fieldElem.setAttribute("field-type", "spacer")
            break
          }
          default: {
            fieldElem.setAttribute("field-type", "text-input")
            break
          }
        }
        fieldElem.value = value
      }  
    } else {
      switch(value) {
        case(EmptyFieldValue.TextInput): {
          fieldElem.setAttribute("field-type", "text-input")
          fieldElem.value = ""
          break
        }
        case(EmptyFieldValue.Spacer): {
          fieldElem.setAttribute("field-type", "spacer")
          break
        }
        case(EmptyFieldValue.Separator): {
          fieldElem.setAttribute("field-type", "separator")
          fieldElem.setAttribute("separator-labels", [separatorLabelX || undefined, separatorLabelY || undefined].toString())
          break
        }
      }
    }

    return fieldElem
  }


  private createCrossword(fields: string[]) {
    const containerElem = document.createElement("form")
    containerElem.classList.add(".cw-container")
    containerElem.style.display = "grid"
    containerElem.style.gridTemplateColumns = `repeat(${this.finalRowsNumber}, 1fr)`
    containerElem.style.gridTemplateRows = `repeat(${this.finalColumnsNumber}, 1fr)`

    containerElem.addEventListener("focus", this._handleFieldFocus.bind(this), true)
    containerElem.addEventListener("blur", this._handleFieldBlur.bind(this), true)

    if (this.isDevMode) {
      containerElem.addEventListener("pointerdown", this._handlePointerDown.bind(this), true)
    }

    this.fillOutCrossword(containerElem, fields)

    return containerElem
  }

  private __toggleFieldDisabledState(fieldElem: HTMLInputElement) {
    (fieldElem as any).toggleFieldType()
  }

  private _handlePointerDown(event: PointerEvent) {
    if (event.ctrlKey) {
      const fieldElem = (event.target as HTMLInputElement)
      this.__toggleFieldDisabledState(fieldElem)
    }
  }

  private _handleFieldBlur(event: Event) {
    (event.target as HTMLInputElement).removeEventListener(
      "keypress",
      this._handleFieldKey.bind(this)
    )
  }

  private _handleFieldFocus(event: Event) {
    const fieldElem = (event.target as HTMLInputElement)
    fieldElem.addEventListener("keydown", this._handleFieldKey.bind(this))
  }

  private _handleFieldKey(event: KeyboardEvent) {
    const fieldElem = (event.target as HTMLInputElement)
    if (
      event.isComposing ||
      event.altKey ||
      event.key === "Tab" ||
      event.key === "Shift"
    ) {
      return
    }

    if (event.key === "ArrowDown") {
      const fieldId = Number(fieldElem.getAttribute("field-id"));
      const nextFieldId = fieldId + this.finalRowsNumber
      if (nextFieldId > this.crosswordLength) {
        return
      }
      const nextFieldElem = (document.querySelector(`[field-id='${nextFieldId}']`) as HTMLInputElement)
      nextFieldElem.focus()
      return
    }

    if (event.key === "ArrowUp") {
      const fieldId = Number(fieldElem.getAttribute("field-id"));
      const nextFieldId = fieldId - this.finalRowsNumber
      if (nextFieldId < 0) {
        return
      }
      const nextFieldElem = (document.querySelector(`[field-id='${nextFieldId}']`) as HTMLInputElement)
      nextFieldElem.focus()
      return
    }

    if (event.key === "ArrowLeft") {
      const fieldId = Number(fieldElem.getAttribute("field-id"));
      const nextFieldId = fieldId - 1
      if (nextFieldId < 0) {
        return
      }
      const nextFieldElem = (document.querySelector(`[field-id='${nextFieldId}']`) as HTMLInputElement)
      nextFieldElem.focus()
      return
    }

    if (event.key === "ArrowRight") {
      const fieldId = Number(fieldElem.getAttribute("field-id"));
      const nextFieldId = fieldId + 1
      if (nextFieldId > this.crosswordLength - 1) {
        return
      }
      const nextFieldElem = (document.querySelector(`[field-id='${nextFieldId}']`) as HTMLInputElement)
      nextFieldElem.focus()
      return
    }



  }
}
