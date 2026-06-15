import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { budgetSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  CATEGORIES_IDS,
  REMINDERS,
  REMINDERS_IDS,
} from "@/api/api.constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import useBudgetMutation from "@/hooks/useBudgetMutation";
import { useEffect, useRef } from "react";
import { DialogClose } from "@radix-ui/react-dialog";

type AddBudgetProps = {
  title: string;
};

export function AddBudget({ title }: AddBudgetProps) {
  const mutation = useBudgetMutation();
  const ref = useRef<HTMLButtonElement>(null);
  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      isPercentage: 0,
      value: 0,
      name: "",
      description: "",
      categoryId: {
        categoryId: 0,
      },
      reminderTypeId: 0,
      enableReminder: 0,
      paymentDate: "",
      price: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof budgetSchema>) {
    mutation.mutate({ type: "Add", request: values });
  }

  useEffect(() => {
    mutation.isSuccess && ref?.current?.click();
  }, [mutation.isSuccess]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-auto px-2 py-0">
          New <PlusCircle className="ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      form.setValue(
                        "categoryId.categoryId",
                        CATEGORIES_IDS[value]
                      );
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CATEGORIES).map((category, i) => (
                        <SelectItem key={`category-${i}`} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reminderTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(REMINDERS_IDS[value]);
                    }}
                    defaultValue={REMINDERS.NO_REMINDER}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Reminder type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(REMINDERS).map((reminder, i) => (
                        <SelectItem key={`reminder-${i}`} value={reminder}>
                          {reminder}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Payment Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "y-MM-dd")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(field.value)}
                        onSelect={(date) => {
                          date && field.onChange(format(date, "y-MM-dd"));
                          form.setFocus("price");
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        let value = Number(e?.target?.value);
                        field.onChange(value >= 0 ? value : 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Submit
            </Button>
            <DialogClose asChild>
              <Button ref={ref} className="hidden"></Button>
            </DialogClose>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
