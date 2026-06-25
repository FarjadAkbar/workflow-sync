"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useInviteUserMutation } from "@/service/users";
import { RoleEnum } from "@prisma/client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  role: z.enum([
    RoleEnum.ADMIN,
    RoleEnum.DEVELOPER,
    RoleEnum.DESIGNER,
    RoleEnum.ANIMATOR,
    RoleEnum.SEO,
    RoleEnum.CONTENT_WRITER,
    RoleEnum.MANAGER,
    RoleEnum.MARKETER,
    RoleEnum.LEAD,
    RoleEnum.IT,
    RoleEnum.OPERATION,
  ]),
});

export function InviteForm() {
  const { mutate, isPending } = useInviteUserMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: RoleEnum.DEVELOPER,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    mutate(values, {
      onSuccess: (data) => {
        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${values.email}`,
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-4 gap-4 w-full"
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem className="w-full md:w-auto">
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem className="w-full md:w-auto">
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full md:w-auto">
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="name@domain.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="w-full md:w-auto">
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={RoleEnum.ADMIN}>Admin</SelectItem>
                  <SelectItem value={RoleEnum.DEVELOPER}>Developer</SelectItem>
                  <SelectItem value={RoleEnum.DESIGNER}>Designer</SelectItem>
                  <SelectItem value={RoleEnum.ANIMATOR}>Animator</SelectItem>
                  <SelectItem value={RoleEnum.SEO}>SEO</SelectItem>
                  <SelectItem value={RoleEnum.CONTENT_WRITER}>
                    Content Writer
                  </SelectItem>
                  <SelectItem value={RoleEnum.MANAGER}>Manager</SelectItem>
                  <SelectItem value={RoleEnum.MARKETER}>Marketer</SelectItem>
                  <SelectItem value={RoleEnum.LEAD}>Lead</SelectItem>
                  <SelectItem value={RoleEnum.IT}>IT</SelectItem>
                  <SelectItem value={RoleEnum.OPERATION}>Operation</SelectItem>
                </SelectContent>
              </Select>
              {/* <FormDescription>
                The user's role determines their permissions in the system.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />


        <Button className="w-full md:w-[150px]" variant="primary" type="submit" disabled={isPending}>
          {isPending ? (
            <Icons.spinner className="animate-spin" />
          ) : (
            "Invite user"
          )}
        </Button>
      </form>
    </Form>
  );
}
