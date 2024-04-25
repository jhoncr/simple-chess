import React from "react"


export default function Dialog({sharebleLink}){

    async function copyToClipboard() {
        await navigator.clipboard.writeText(sharebleLink)
      }

    return (
        <div className="notification is-info">
          <strong>Share this game to continue</strong>
          <div className="field has-addons">
            <div className="control is-expanded">
              <input type="text" name="" id="" className="input" readOnly value={sharebleLink} />
            </div>
            <div className="control">
              <button className="button" onClick={copyToClipboard}>Copy</button>
            </div>
          </div>
        </div>
    )

}