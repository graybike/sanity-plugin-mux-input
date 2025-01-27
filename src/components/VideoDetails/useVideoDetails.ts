import {useToast} from '@sanity/ui'
import {useState} from 'react'
import {useDocumentStore} from 'sanity'

import {useClient} from '../../hooks/useClient'
import useDocReferences from '../../hooks/useDocReferences'
import getVideoMetadata from '../../util/getVideoMetadata'
import {PluginPlacement, VideoAssetDocument} from '../../util/types'

export interface FileDetailsProps {
  placement: PluginPlacement
  closeDialog: () => void
  asset: VideoAssetDocument & {autoPlay?: boolean}
}

export default function useFileDetails(props: FileDetailsProps) {
  const documentStore = useDocumentStore()
  const toast = useToast()
  const client = useClient()
  const [references, referencesLoading] = useDocReferences({
    documentStore,
    id: props.asset._id as string,
  })

  const [originalAsset, setOriginalAsset] = useState(() => props.asset)
  const [filename, setFilename] = useState(props.asset.filename)
  const modified = filename !== originalAsset.filename

  const displayInfo = getVideoMetadata({...props.asset, filename})

  const [state, setState] = useState<'deleting' | 'closing' | 'idle' | 'saving'>('idle')

  function handleClose() {
    if (state !== 'idle') return

    if (modified) {
      setState('closing')
      return
    }

    props.closeDialog()
  }

  function confirmClose(shouldClose: boolean) {
    if (state !== 'closing') return

    if (shouldClose) props.closeDialog()

    setState('idle')
  }

  async function saveChanges() {
    if (state !== 'idle') return
    setState('saving')

    try {
      await client.patch(props.asset._id).set({filename}).commit()
      setOriginalAsset((prev) => ({...prev, filename}))
      toast.push({title: 'File name updated', status: 'success'})
    } catch (error) {
      toast.push({
        title: 'Failed updating file name',
        status: 'error',
        description: typeof error === 'string' ? error : 'Please try again',
      })
      setFilename(originalAsset.filename)
    }

    setState('idle')
  }

  return {
    references,
    referencesLoading,
    modified,
    filename,
    setFilename,
    displayInfo,
    state,
    setState,
    handleClose,
    confirmClose,
    saveChanges,
  }
}
