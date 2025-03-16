import {
    Palette,
    Globe,
    Layout,
    Printer,
    Megaphone,
    PenTool,
    Smartphone,
    Camera,
    Video,
    FileText,
    MessageSquare,
    Code,
  } from "lucide-react"
  
  interface ServiceCardProps {
    title: string
    description: string
    icon: string
  }
  
  export function ServiceCard({ title, description, icon }: ServiceCardProps) {
    const getIcon = () => {
      switch (icon) {
        case "palette":
          return <Palette className="h-6 w-6" />
        case "globe":
          return <Globe className="h-6 w-6" />
        case "layout":
          return <Layout className="h-6 w-6" />
        case "printer":
          return <Printer className="h-6 w-6" />
        case "megaphone":
          return <Megaphone className="h-6 w-6" />
        case "pen-tool":
          return <PenTool className="h-6 w-6" />
        case "smartphone":
          return <Smartphone className="h-6 w-6" />
        case "camera":
          return <Camera className="h-6 w-6" />
        case "video":
          return <Video className="h-6 w-6" />
        case "file-text":
          return <FileText className="h-6 w-6" />
        case "message-square":
          return <MessageSquare className="h-6 w-6" />
        case "code":
          return <Code className="h-6 w-6" />
        default:
          return <Layout className="h-6 w-6" />
      }
    }
  
    return (
      <div
        className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
        style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      >
        <div className="w-12 h-12 bg-gray-100 text-black rounded-lg flex items-center justify-center mb-4">
          {getIcon()}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    )
  }
  
  