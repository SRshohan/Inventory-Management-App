'use client'

import { useState, useEffect } from 'react'
import Fuse from 'fuse.js'
import { Box, Stack, Typography, Button, Modal, TextField, IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'; // Plus icon
import RemoveIcon from '@mui/icons-material/Remove'; // Minus icon
import DeleteIcon from '@mui/icons-material/Delete'; // Trash icon
import { firestore } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore'

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
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
    setFilteredInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    // Initialize Fuse.js for search
    const fuse = new Fuse(inventory, {
      keys: ['name'],
      includeScore: true,
    })
    
    // Perform search if searchTerm is not empty
    if (searchTerm.trim()) {
      const results = fuse.search(searchTerm)
      setFilteredInventory(results.map(result => result.item))
    } else {
      setFilteredInventory(inventory)
    }
  }, [searchTerm, inventory])

  const addItem = async (item, quantity) => {
    // Ensure quantity is defined and is a number, defaulting to 1 if not
    const parsedQuantity = quantity ? parseInt(quantity, 10) : 1;
  
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      const currentQuantity = data.quantity
      await setDoc(docRef, { quantity: currentQuantity + parsedQuantity })
    } else {
      await setDoc(docRef, { quantity: parsedQuantity })
    }
    
    await updateInventory()
  }
  

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item)
      const docSnap = await getDoc(docRef)
  
      if (docSnap.exists()) {
        await deleteDoc(docRef)
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
    const docRef = doc(collection(firestore, 'inventory'), item)
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
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
            />

            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, itemQuantity)
                setItemName('')
                setItemQuantity('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      
      {/* Search Input */}
      <TextField
        id="search"
        label="Search Items"
        className='inputBox'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

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
          <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {filteredInventory.map(({ name, quantity }) => (
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
              <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                <IconButton
                  onClick={() => handleSubQuantity(name)}
                  color="primary"
                  aria-label="subtract"
                  disabled={quantity === 0}
                >
                  <RemoveIcon />
                </IconButton>

                <Typography variant={'body1'} color={'#333'} textAlign={'center'}>
                  {quantity}
                </Typography>

                <IconButton
                  onClick={() => handleAddQuantity(name)}
                  color="primary"
                  aria-label="add"
                >
                  <AddIcon />
                </IconButton>

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
