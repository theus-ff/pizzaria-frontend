"use client"
import { createContext, ReactNode, useState } from "react"
import { api } from "@/services/api";
import { getCookieClient } from "@/lib/cookieClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface OrderItemProps{
  id: string;
  amount: number;
  created_at: string;
  order_id: string;
  product_id: string;
  product:{
    id: string;
    name: string;
    price: string;
    description: string;
    banner: string;
    category_id: string;
  };
  order:{
    id: string;
    table: number;
    name: string | null;
    draft: boolean;
    status: boolean;
  };
}

type OrderContextData = {
  isOpen: boolean;
  order: OrderItemProps[];
  onRequestOpen: (order_id: string) => Promise<void>;
  onRequestClose: () => void;
  finishOrder: (order_id: string) => Promise<void>;
}

type OrderProviderProps = {
  children: ReactNode;
}

export const OrderContext = createContext({} as OrderContextData)

export function OrderProvider({ children }: OrderProviderProps){
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState<OrderItemProps[]>([])

  async function onRequestOpen(order_id: string){
    const token = getCookieClient()
    
    const response = await api.get("/orders/detail", {
      headers:{
        Authorization: `Bearer ${token}`
      },
      params:{
        order_id: order_id,
      }
    })
    
    setOrder(response.data)
    setIsOpen(true)
  }

  function onRequestClose(){
    setIsOpen(false)
  }

  async function finishOrder(order_id: string){
    const token = getCookieClient();

    const data = {
      order_id: order_id,
    }

    try{
      await api.put("/order/finish", data, {
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
    }catch(err){
      console.log(err)
      toast.error("Falha ao finalizar este pedido!")
      return;
    }

    toast.success("Pedido finalizado com sucesso!")
    setIsOpen(false);
    router.refresh()
  }

  return(
    <OrderContext.Provider 
      value={{
        isOpen,
        order,
        
        onRequestOpen,
        onRequestClose,
        finishOrder,

      }} 
    >
      {children}
    </OrderContext.Provider>
  )
}