import {TrashIcon} from '@sanity/icons'
import {Button, Card, Checkbox, Dialog, Flex, Heading, Stack, Text, useToast} from '@sanity/ui'
import React, {useEffect, useState} from 'react'
import {SanityDocument} from 'sanity'

import {deleteAsset} from '../../actions/assets'
import {useClient} from '../../hooks/useClient'
import {DIALOGS_Z_INDEX} from '../../util/constants'
import {PluginPlacement, VideoAssetDocument} from '../../util/types'
import SpinnerBox from '../SpinnerBox'
import FileReferences from './VideoReferences'

export default function DeleteDialog({
  asset,
  references,
  referencesLoading,
  cancelDelete,
  placement,
  succeededDeleting,
}: {
  asset: VideoAssetDocument
  placement: PluginPlacement
  references?: SanityDocument[]
  referencesLoading: boolean
  cancelDelete: () => void
  succeededDeleting: () => void
}) {
  const client = useClient()
  const [state, setState] = useState<
    'processing_deletion' | 'checkingReferences' | 'error_deleting' | 'cantDelete' | 'confirm'
  >('checkingReferences')
  const [deleteOnMux, setDeleteOnMux] = useState(true)
  const toast = useToast()

  useEffect(() => {
    if (state !== 'checkingReferences' || referencesLoading) return

    setState(references?.length ? 'cantDelete' : 'confirm')
  }, [state, references, referencesLoading])

  async function confirmDelete() {
    if (state !== 'confirm') return

    setState('processing_deletion')
    const worked = await deleteAsset({client, asset, deleteOnMux})
    if (worked === true) {
      toast.push({title: 'Successfully deleted video', status: 'success'})
      succeededDeleting()
    } else if (worked === 'failed-mux') {
      toast.push({
        title: 'Deleted video in Sanity',
        description: "But it wasn't deleted in Mux",
        status: 'warning',
      })
      succeededDeleting()
    } else {
      toast.push({title: 'Failed deleting video', status: 'error'})

      setState('error_deleting')
    }
  }

  return (
    <Dialog
      header={'Delete file'}
      zOffset={DIALOGS_Z_INDEX}
      id="deleting-file-details-dialog"
      onClose={cancelDelete}
      onClickOutside={cancelDelete}
      width={1}
      position="fixed"
      footer={
        <Card padding={3}>
          <Flex justify="space-between" align="center">
            <Button
              icon={TrashIcon}
              fontSize={2}
              padding={3}
              text="Delete file"
              tone="critical"
              onClick={confirmDelete}
              disabled={['processing_deletion', 'checkingReferences', 'cantDelete'].some(
                (s) => s === state
              )}
            />
          </Flex>
        </Card>
      }
    >
      <Card
        padding={5}
        style={{
          minHeight: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack space={3}>
          {state === 'checkingReferences' && (
            <>
              <Heading size={2}>Checking if file can be deleted</Heading>
              <SpinnerBox />
            </>
          )}
          {state === 'cantDelete' && (
            <>
              <Heading size={2}>Video can't be deleted</Heading>
              <Text size={2} style={{marginBottom: '2rem'}}>
                There are {references?.length} document{references && references.length > 0 && 's'}{' '}
                pointing to this file. Remove their references to this file or delete them before
                proceeding.
              </Text>
              <FileReferences
                references={references}
                isLoaded={!referencesLoading}
                placement={placement}
              />
            </>
          )}
          {state === 'confirm' && (
            <>
              <Heading size={2}>Are you sure you want to delete this file?</Heading>
              <Text size={2}>This action is irreversible</Text>
              <Stack space={4} marginTop={4}>
                <Flex align="center" as="label">
                  <Checkbox
                    checked={deleteOnMux}
                    onChange={() => setDeleteOnMux((prev) => !prev)}
                  />
                  <Text style={{margin: '0 10px'}}>Delete asset on Mux</Text>
                </Flex>
                <Flex align="center" as="label">
                  <Checkbox disabled checked />
                  <Text style={{margin: '0 10px'}}>Delete video from dataset</Text>
                </Flex>
              </Stack>
            </>
          )}
          {state === 'processing_deletion' && (
            <>
              <Heading size={2}>Deleting file...</Heading>
              <SpinnerBox />
            </>
          )}
          {state === 'error_deleting' && (
            <>
              <Heading size={2}>Something went wrong!</Heading>
              <Text size={2}>Try deleting the file again by clicking the button below</Text>
            </>
          )}
        </Stack>
      </Card>
    </Dialog>
  )
}
