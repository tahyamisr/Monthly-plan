"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import React, { useTransition } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { submitPlan } from "./actions";
import { Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  governorate: z.string().min(1, "الرجاء اختيار المحافظة."),
  month: z.string().min(1, "الرجاء اختيار الشهر."),
  events: z
    .array(
      z.object({
        details: z.string().min(1, "تفاصيل الحدث مطلوبة."),
        date: z.string().min(1, "التاريخ مطلوب."),
        type: z.string().min(1, "نوع الحدث مطلوب."),
      })
    )
    .min(1, "يجب إضافة فعالية واحدة على الأقل."),
  deputies: z.array(z.object({ name: z.string().min(2, "اسم النائب مطلوب.") })),
  president: z.string().min(2, "اسم الرئيس مطلوب."),
});

const months = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const governorates = [
    "الجيزة", "القاهرة", "الدقهلية", "السويس", "البحيرة", 
    "الشرقية", "المنوفية", "الفيوم", "كفر الشيخ", "قنا", 
    "اسوان", "المنيا", "الاسكندريه", "الاسماعيليه", "القليوبية"
];

const eventTypes = ["اونلاين", "اوفلاين"];

export function PlanForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [govDisplay, setGovDisplay] = React.useState("...............");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      governorate: "",
      month: "",
      events: [],
      deputies: [{ name: "" }],
      president: "",
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

  const handleAddEventRow = () => {
    appendEvent({ details: "", date: "", type: "" });
  };
  
  React.useEffect(() => {
    if (eventFields.length === 0) {
        appendEvent({ details: "", date: "", type: "اونلاين" });
        appendEvent({ details: "", date: "", type: "اونلاين" });
    }
  }, [appendEvent, eventFields.length]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const submissionData = {
        governorate: values.governorate,
        month: values.month,
        presidentSign: values.president,
        deputySigns: values.deputies.map(d => d.name).filter(Boolean),
        events: values.events.map(e => ({ name: e.details, date: e.date, type: e.type }))
      };
      
      const result = await submitPlan(submissionData as any);
      if (result.success) {
        toast({
          title: "تم الإرسال بنجاح!",
          description: "سيتم إعادة تحميل النموذج الآن...",
          variant: "default",
          className: "bg-green-600 text-white",
        });
        setTimeout(() => {
            form.reset();
            setGovDisplay("...............");
        }, 2500);

      } else {
        toast({
          title: "خطأ!",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  }

  const DateSelector = ({ rowIndex }: { rowIndex: number }) => {
    const [day, setDay] = React.useState("");
    const [month, setMonth] = React.useState("");
    const [year, setYear] = React.useState("");

    React.useEffect(() => {
      if (day && month && year) {
        form.setValue(`events.${rowIndex}.date`, `${day}/${month}/${year}`);
      } else {
        form.setValue(`events.${rowIndex}.date`, "");
      }
    }, [day, month, year, rowIndex, form]);

    return (
      <div className="flex gap-2 justify-center">
        <Select onValueChange={setDay} value={day}>
          <SelectTrigger><SelectValue placeholder="اليوم" /></SelectTrigger>
          <SelectContent>{Array.from({ length: 31 }, (_, i) => <SelectItem key={i+1} value={`${i+1}`}>{i+1}</SelectItem>)}</SelectContent>
        </Select>
        <Select onValueChange={setMonth} value={month}>
          <SelectTrigger><SelectValue placeholder="الشهر" /></SelectTrigger>
          <SelectContent>{Array.from({ length: 12 }, (_, i) => <SelectItem key={i+1} value={`${i+1}`}>{i+1}</SelectItem>)}</SelectContent>
        </Select>
         <Select onValueChange={setYear} value={year}>
          <SelectTrigger><SelectValue placeholder="السنة" /></SelectTrigger>
          <SelectContent>{Array.from({ length: 6 }, (_, i) => <SelectItem key={i} value={`${new Date().getFullYear() + i}`}>{new Date().getFullYear() + i}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    );
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h3 className="text-3xl font-bold text-center text-red-700 my-6">خطة الشهر</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg mb-8 p-4 bg-gray-50 rounded-md">
            <FormField
              control={form.control}
              name="governorate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">المحافظة:</FormLabel>
                  <Select onValueChange={(value) => {
                      field.onChange(value);
                      setGovDisplay(value || "...............");
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {governorates.map((gov) => <SelectItem key={gov} value={gov}>{gov}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">الشهر:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="اختر الشهر" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        
        <div className="text-gray-700 leading-relaxed mb-8 text-center space-y-4">
            <p>
                نود نحن، لجنة التنظيم بمحافظة <span id="govDisplay" className={cn(govDisplay === 'الشرقية' && "text-black font-bold")}>{govDisplay}</span>،
                أن نُعلم سيادتكم، القائد/ <strong className="text-gray-900">إسلام فارس</strong> (رئيس لجنة التنظيم المركزية)،
                والقائد/ <strong className="text-gray-900">ريم منصور</strong> (نائب رئيس اللجنة)،
                والقائد/ <strong className="text-gray-900">أحمد حسن</strong> (نائب رئيس اللجنة)،
                بخطة عمل اللجنة خلال الفترة القادمة.
            </p>
        </div>

        <div className="space-y-6">
            {eventFields.map((field, index) => (
              <Card key={field.id} className="bg-gray-50 border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-xl text-gray-800">الفعالية #{index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8"
                    onClick={() => removeEvent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`events.${index}.details`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ما هو الحدث؟</FormLabel>
                        <FormControl>
                          <Input placeholder="تفاصيل الحدث" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`events.${index}.date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>متى سيقام الحدث؟</FormLabel>
                        <FormControl>
                          <>
                            <DateSelector rowIndex={index} />
                            <Input type="hidden" {...field} />
                          </>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`events.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ما هو نوع الحدث؟</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر النوع" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {eventTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
             <FormMessage>{form.formState.errors.events?.root?.message}</FormMessage>
        </div>

        <div className="mt-4 text-left">
            <Button type="button" onClick={handleAddEventRow} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition">
              + إضافة فعالية
            </Button>
        </div>

        <footer className="mt-20 pt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="text-center">
                <p className="font-bold text-lg">نائب رئيس اللجنة</p>
                <div className="space-y-2 mt-4 mx-auto max-w-xs">
                    {deputyFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                          <FormField
                            control={form.control}
                            name={`deputies.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormControl>
                                      <Input placeholder={`اسم النائب ${index > 0 ? index + 1 : ''}`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                           />
                           {index > 0 && (
                            <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700 p-1" onClick={() => removeDeputy(index)}>
                                <Trash2 className="h-5 w-5" />
                            </Button>
                           )}
                      </div>
                    ))}
                </div>
                <Button type="button" onClick={() => appendDeputy({ name: "" })} className="mt-2 text-sm text-blue-600 hover:text-blue-800" variant="link">
                    + إضافة نائب آخر
                </Button>
            </div>
             <div className="text-center">
                <p className="font-bold text-lg">رئيس اللجنة</p>
                 <FormField
                    control={form.control}
                    name="president"
                    render={({ field }) => (
                        <FormItem className="mt-4 mx-auto max-w-xs">
                            <FormControl>
                                <Input placeholder="الاسم" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
            </div>
        </footer>

        <div className="mt-12 text-center">
          <Button type="submit" size="lg" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition shadow-lg w-48">
            {isPending ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                <span>جار الإرسال...</span>
              </>
            ) : (
              "إرسال الخطة"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
