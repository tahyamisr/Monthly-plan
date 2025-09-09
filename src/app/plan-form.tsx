"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import React, { useTransition } from "react";
import { format } from "date-fns";
import { ar } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { submitPlan } from "./actions";
import { CalendarIcon, Loader2, PlusCircle, Trash2 } from "lucide-react";

const formSchema = z.object({
  governorate: z.string().min(2, "اسم المحافظة مطلوب."),
  month: z.string({ required_error: "الرجاء اختيار الشهر." }),
  events: z
    .array(
      z.object({
        details: z.string().min(5, "يجب أن لا تقل التفاصيل عن 5 أحرف."),
        date: z.date({ required_error: "التاريخ مطلوب." }),
        type: z.string({ required_error: "الرجاء اختيار نوع الفعالية." }),
      })
    )
    .min(1, "يجب إضافة فعالية واحدة على الأقل."),
  deputies: z
    .array(
      z.object({
        name: z.string().min(2, "اسم النائب مطلوب."),
      })
    )
    .min(1, "يجب إضافة توقيع نائب واحد على الأقل."),
});

const months = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const eventTypes = ["ثقافي", "اجتماعي", "رياضي", "أكاديمي", "فني", "تطوعي", "أخرى"];

type EventFormData = {
    details: string;
    date: Date;
    type: string;
};

export function PlanForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [eventFormData, setEventFormData] = React.useState<EventFormData>({
    details: "",
    date: new Date(),
    type: "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      governorate: "",
      events: [],
      deputies: [],
    },
  });

  const { fields: eventFields, append: appendEvent, remove: removeEvent } = useFieldArray({
    control: form.control,
    name: "events",
  });

  const { fields: deputyFields, append: appendDeputy, remove: removeDeputy } = useFieldArray({
    control: form.control,
    name: "deputies",
  });
  
  const handleAddEvent = () => {
    if (eventFormData.details.length < 5 || !eventFormData.date || !eventFormData.type) {
      toast({
        title: "خطأ!",
        description: "يرجى تعبئة جميع حقول الفعالية.",
        variant: "destructive",
      });
      return;
    }
    appendEvent(eventFormData);
    setEventFormData({ details: "", date: new Date(), type: "" });
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await submitPlan(values);
      if (result.success) {
        toast({
          title: "تم بنجاح!",
          description: result.message,
        });
        form.reset();
      } else {
        toast({
          title: "خطأ!",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الخطة</CardTitle>
            <CardDescription>
              يرجى إدخال المعلومات الأساسية للخطة الشهرية.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="governorate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المحافظة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: القاهرة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الشهر</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشهر" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إضافة فعالية جديدة</CardTitle>
            <CardDescription>
              أدخل تفاصيل الفعالية واضغط على زر الإضافة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <FormLabel>تفاصيل الفعالية</FormLabel>
                <Textarea 
                    placeholder="وصف موجز للفعالية..." 
                    value={eventFormData.details}
                    onChange={(e) => setEventFormData({...eventFormData, details: e.target.value})}
                    className="min-h-[60px]"
                />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <FormLabel>التاريخ</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-right font-normal",
                                !eventFormData.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {eventFormData.date ? (
                                format(eventFormData.date, "PPP", { locale: ar })
                              ) : (
                                <span>اختر تاريخ</span>
                              )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={eventFormData.date}
                            onSelect={(date) => date && setEventFormData({...eventFormData, date})}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            locale={ar}
                            dir="rtl"
                          />
                        </PopoverContent>
                    </Popover>
                 </div>
                 <div className="space-y-2">
                    <FormLabel>نوع الفعالية</FormLabel>
                     <Select 
                        value={eventFormData.type}
                        onValueChange={(value) => setEventFormData({...eventFormData, type: value})}
                     >
                        <SelectTrigger>
                            <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                 </div>
            </div>
             <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleAddEvent}
            >
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة الفعالية للجدول
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الفعاليات والأنشطة المضافة</CardTitle>
            <CardDescription>
              قائمة بالفعاليات التي تمت إضافتها للخطة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">تفاصيل الفعالية</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>نوع الفعالية</TableHead>
                    <TableHead className="text-left">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventFields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.details}</TableCell>
                       <TableCell>
                        {format(field.date, "PPP", { locale: ar })}
                      </TableCell>
                       <TableCell>{field.type}</TableCell>
                      <TableCell className="text-left">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEvent(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {eventFields.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            لا توجد فعاليات مضافة.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
               <FormField
                  control={form.control}
                  name="events"
                  render={() => (
                     <FormItem>
                       <FormMessage className="mt-2" />
                     </FormItem>
                  )}
                />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توقيعات النواب</CardTitle>
            <CardDescription>
              أضف أسماء النواب للموافقة على الخطة.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deputyFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name={`deputies.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`اسم النائب ${index + 1}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDeputy(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
             <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => appendDeputy({ name: "" })}
            >
              <PlusCircle className="ml-2 h-4 w-4" />
              إضافة توقيع نائب
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isPending} className="font-bold">
            {isPending ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري التقديم...
              </>
            ) : (
              "تقديم الخطة"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
