import {useId} from '@reach/auto-id'
import {Dialog} from '@sanity/ui'
import React from 'react'

import SelectAsset, {type Props as SelectAssetProps} from './SelectAsset'

interface Props extends Pick<SelectAssetProps, 'onSelect'> {
  onClose: () => void
}
export default function InputBrowser({onClose, onSelect}: Props) {
  const id = `InputBrowser${useId()}`
  return (
    <Dialog __unstable_autoFocus header="Select video" id={id} onClose={onClose} width={2}>
      <SelectAsset onSelect={onSelect} />
    </Dialog>
  )
}
