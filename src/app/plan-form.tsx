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
  deputies: z.array(z.object({ name: z.string().min(2, "اسم النائب مطلوب.") })).min(1, "يجب إضافة نائب واحد على الأقل."),
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
  const [showEventForm, setShowEventForm] = React.useState(false);
  const [showSignatures, setShowSignatures] = React.useState(false);

  // State for the new event being created
  const [newEvent, setNewEvent] = React.useState({ details: "", date: "", type: "" });
  const [newDate, setNewDate] = React.useState({ day: "", month: "", year: "" });


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
  
  const selectedMonth = form.watch("month");

  const { fields: eventFields, append: appendEvent, remove: removeEvent } = useFieldArray({
    control: form.control,
    name: "events",
  });

  const { fields: deputyFields, append: appendDeputy, remove: removeDeputy } = useFieldArray({
    control: form.control,
    name: "deputies",
  });

  const handleAddEventRow = () => {
    const fullDate = newDate.day && newDate.month && newDate.year ? `${newDate.day}/${newDate.month}/${newDate.year}` : "";
    const eventToadd = { ...newEvent, date: fullDate };

    // Simple validation before adding
    if (!eventToadd.details || !eventToadd.date || !eventToadd.type) {
        toast({
            title: "بيانات غير مكتملة",
            description: "الرجاء ملء جميع حقول الفعالية قبل الحفظ.",
            variant: "destructive",
        });
        return;
    }

    appendEvent(eventToadd);
    // Reset for next event
    setNewEvent({ details: "", date: "", type: "" });
    setNewDate({ day: "", month: "", year: "" });
    setShowEventForm(false);
  };
  
  const handleShowSignatures = () => {
      setShowSignatures(true);
  }

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
            form.reset({
              governorate: "",
              month: "",
              events: [],
              deputies: [{ name: "" }],
              president: "",
            });
            setGovDisplay("...............");
            setShowEventForm(false);
            setShowSignatures(false);
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
  
  const DateSelector = ({ value, onChange }: { value: {day: string, month: string, year: string}, onChange: (date: {day: string, month: string, year: string}) => void }) => {
    return (
      <div className="flex gap-2 justify-center">
        <Select onValueChange={(day) => onChange({...value, day})} value={value.day}>
          <SelectTrigger><SelectValue placeholder="اليوم" /></SelectTrigger>
          <SelectContent>{Array.from({ length: 31 }, (_, i) => <SelectItem key={i+1} value={`${i+1}`}>{i+1}</SelectItem>)}</SelectContent>
        </Select>
        <Select onValueChange={(month) => onChange({...value, month})} value={value.month}>
          <SelectTrigger><SelectValue placeholder="الشهر" /></SelectTrigger>
          <SelectContent>{Array.from({ length: 12 }, (_, i) => <SelectItem key={i+1} value={`${i+1}`}>{i+1}</SelectItem>)}</SelectContent>
        </Select>
         <Select onValueChange={(year) => onChange({...value, year})} value={value.year}>
          <SelectTrigger><SelectValue placeholder="السنة" /></SelectTrigger>
          <SelectContent>{Array.from({ length: 6 }, (_, i) => <SelectItem key={i} value={`${new Date().getFullYear() + i}`}>{new Date().getFullYear() + i}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    );
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h3 className="text-3xl font-bold text-center text-primary my-6">خطة الشهر</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg mb-8 p-4 bg-muted/50 rounded-md">
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
        
        <div className="text-foreground text-sm leading-relaxed mb-6 text-center space-y-2 bg-muted/50 p-3 rounded-md">
            <p>خطة شهر <span className="font-bold text-primary">{selectedMonth || "................"}</span></p>
            <p>مقدم من لجنة التنظيم بمحافظة <span className="font-bold text-primary">{govDisplay}</span>.</p>
            <p className="font-semibold">إلى السادة:</p>
            <ul className="list-none p-0 m-0 text-xs text-muted-foreground">
                <li>القائد/ <strong className="text-foreground">إسلام فارس</strong> (رئيس لجنة التنظيم المركزية)</li>
                <li>القائد/ <strong className="text-foreground">ريم منصور</strong> (نائب رئيس اللجنة)</li>
                <li>القائد/ <strong className="text-foreground">أحمد حسن</strong> (نائب رئيس اللجنة)</li>
            </ul>
            <p className="text-xs pt-2">نعرض على سيادتكم خطة عمل اللجنة المقترحة.</p>
        </div>

        {/* Events Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">الأحداث</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md bg-muted/50 relative">
                <div className="mb-2">
                    <p className="font-bold">الفعالية #{index + 1}:</p>
                    <p>{field.details}</p>
                </div>
                <p><strong>التاريخ:</strong> {field.date}</p>
                <p><strong>النوع:</strong> {field.type}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full h-8 w-8"
                  onClick={() => removeEvent(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
             <FormMessage>{form.formState.errors.events?.root?.message || form.formState.errors.events?.message}</FormMessage>

            {showEventForm && (
                <div className="p-4 border rounded-md mt-4 space-y-4">
                    <h4 className="font-bold text-lg">إضافة فعالية جديدة</h4>
                    <FormItem>
                      <FormLabel>ما هو الحدث؟</FormLabel>
                      <FormControl>
                          <Input 
                              placeholder="تفاصيل الحدث" 
                              value={newEvent.details}
                              onChange={(e) => setNewEvent({...newEvent, details: e.target.value})}
                          />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>متى سيقام الحدث؟</FormLabel>
                       <FormControl>
                          <DateSelector value={newDate} onChange={setNewDate} />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>ما هو نوع الحدث؟</FormLabel>
                      <Select 
                          onValueChange={(value) => setNewEvent({...newEvent, type: value})} 
                          value={newEvent.type}>
                        <FormControl><SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger></FormControl>
                        <SelectContent>{eventTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                    <Button type="button" onClick={handleAddEventRow}>حفظ الفعالية</Button>
                </div>
            )}
             <div className="mt-4 text-left">
                <Button type="button" onClick={() => setShowEventForm(true)} variant="secondary" disabled={showEventForm}>
                  + إضافة فعالية
                </Button>
            </div>
          </CardContent>
        </Card>


        {/* Signatures Section */}
        <footer className="mt-10 pt-6 border-t">
             {!showSignatures ? (
                <div className="text-center">
                    <Button type="button" onClick={handleShowSignatures} variant="secondary">
                        إضافة التوقيعات
                    </Button>
                </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                                          <Input placeholder={`اسم النائب ${deputyFields.length > 1 ? index + 1 : ''}`} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                               {deputyFields.length > 1 && (
                                <Button type="button" variant="ghost" className="text-destructive hover:text-destructive/90 p-1" onClick={() => removeDeputy(index)}>
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                               )}
                          </div>
                        ))}
                    </div>
                     <FormMessage>{form.formState.errors.deputies?.root?.message || form.formState.errors.deputies?.message}</FormMessage>
                    <Button type="button" onClick={() => appendDeputy({ name: "" })} className="mt-2 text-sm text-primary hover:text-primary/90" variant="link">
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
            </div>
             )}
        </footer>


        <div className="mt-12 text-center">
          <Button type="submit" size="lg" disabled={isPending || !showSignatures} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition shadow-lg w-48">
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
