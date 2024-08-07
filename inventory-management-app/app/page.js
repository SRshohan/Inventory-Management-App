'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add'; // Plus icon
import RemoveIcon from '@mui/icons-material/Remove'; // Minus icon
import DeleteIcon from '@mui/icons-material/Delete'; // Trash icon
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(true)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      const currentQuantity = data.quantity
      // Ensure quantity is a number by using parseInt
      const parsedQuantity = parseInt(quantity, 10)
      await setDoc(docRef, { quantity: currentQuantity + parsedQuantity })
    } else {
      // Default quantity to 1 if the item does not exist
      await setDoc(docRef, { quantity: 1 })
    }
    
    await updateInventory()
  }
  

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
  
      if (docSnap.exists()) {
        // Document exists, proceed with deletion
        await deleteDoc(docRef)
        // Update inventory after deletion
        await updateInventory()
      } else {
        console.log(`Item ${item} does not exist.`)
      }
    } catch (error) {
      console.error("Error removing item: ", error)
    }
  }
  

  const handleAddQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    }
    await updateInventory()
  }

  const handleSubQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item) // Fixed typo
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity > 1) {
        await setDoc(docRef, { quantity: quantity - 1 })
      } else if (quantity === 1) {
        await deleteDoc(docRef)
      }
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="item-quantity"
              label="Quantity"
              variant="outlined"
              type="number" // Ensure only numeric values
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
            />

            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, itemQuantity)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
              paddingY={2}
            >
              {/* Item Name */}
              <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>

              {/* Quantity and Buttons */}
              <Box display="flex" alignItems="center" gap={1}>
                {/* Subtract Button */}
                <IconButton
                  onClick={() => handleSubQuantity(name)}
                  color="primary"
                  aria-label="subtract"
                  disabled={quantity === 0} // Disable button if quantity is zero
                >
                  <RemoveIcon />
                </IconButton>

                {/* Quantity Display */}
                <Typography variant={'body1'} color={'#333'} textAlign={'center'}>
                  {quantity}
                </Typography>

                {/* Add Button */}
                <IconButton
                  onClick={() => handleAddQuantity(name)}
                  color="primary"
                  aria-label="add"
                >
                  <AddIcon />
                </IconButton>

                {/* Delete Button */}
                <IconButton
                  onClick={() => removeItem(name)}
                  color="secondary"
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
